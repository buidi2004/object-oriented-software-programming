using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IUnitOfWork _uow;

    public ContactController(
        IEmailService emailService,
        IRepository<SupportTicket> ticketRepo,
        IRepository<AppUser> userRepo,
        IUnitOfWork uow)
    {
        _emailService = emailService;
        _ticketRepo = ticketRepo;
        _userRepo = userRepo;
        _uow = uow;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Editor,Support,Staff,Accountant,Technician")]
    public async Task<IActionResult> GetAllContacts(CancellationToken ct)
    {
        var tickets = await _ticketRepo.GetAllAsync(ct);
        var contactTickets = tickets
            .Where(t => t.Subject != null && (t.Subject.StartsWith("[Tư Vấn]") || t.Subject.StartsWith("[Contact]") || t.Subject.StartsWith("[Website Contact]")))
            .Select(t => {
                var firstMsg = t.Messages.OrderBy(m => m.CreatedAt).FirstOrDefault();
                return new {
                    id = t.Id,
                    subject = t.Subject,
                    status = t.Status.ToString().ToLower(),
                    priority = t.Priority.ToString().ToLower(),
                    createdAt = firstMsg?.CreatedAt ?? DateTime.UtcNow,
                    messageCount = t.Messages.Count,
                    content = firstMsg?.Message ?? "",
                    assignedStaffId = t.AssignedStaffId
                };
            })
            .OrderByDescending(t => t.createdAt);

        return Ok(contactTickets);
    }

    [HttpPost]
    public async Task<IActionResult> SubmitContactForm([FromBody] ContactRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Email và nội dung không được để trống." });
        }

        // 1. Find or pick user to associate ticket with
        var users = await _userRepo.GetAllAsync(ct);
        var existingUser = users.FirstOrDefault(u => u.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
                           ?? users.FirstOrDefault(u => u.Role?.Name == "Admin")
                           ?? users.FirstOrDefault();

        Guid userId = existingUser?.Id ?? Guid.NewGuid();

        // 2. Create support ticket for Admin moderation
        string subject = $"[Tư Vấn] {request.Subject} - {request.Name}";
        var ticket = new SupportTicket(userId, subject, TicketPriority.Medium);
        
        string formattedContent = $"📋 YÊU CẦU TƯ VẤN TỪ WEBSITE\n" +
                                 $"👤 Họ tên: {request.Name}\n" +
                                 $"📧 Email: {request.Email}\n" +
                                 $"📞 Điện thoại: {request.Phone ?? "N/A"}\n" +
                                 $"🎯 Chủ đề quan tâm: {request.Subject}\n\n" +
                                 $"💬 Nội dung tin nhắn:\n{request.Message}";

        ticket.AddMessage(userId, formattedContent);

        await _ticketRepo.AddAsync(ticket, ct);
        await _uow.SaveChangesAsync(ct);

        // 3. Send Notification Email to Admin
        string htmlMessage = $@"
            <h2>Yêu cầu tư vấn &amp; liên hệ mới từ khách hàng</h2>
            <p><strong>Họ tên:</strong> {request.Name}</p>
            <p><strong>Email:</strong> {request.Email}</p>
            <p><strong>Số điện thoại:</strong> {request.Phone ?? "N/A"}</p>
            <p><strong>Chủ đề quan tâm:</strong> {request.Subject}</p>
            <p><strong>Nội dung yêu cầu:</strong></p>
            <blockquote>{request.Message.Replace("\n", "<br/>")}</blockquote>
            <p><em>Yêu cầu đã được tự động tạo thành Ticket ID: #{ticket.Id} trên Admin Panel.</em></p>
        ";

        try {
            await _emailService.SendEmailAsync("admin@cloudservicestore.com", subject, htmlMessage);
        } catch { }

        // 4. Send Confirmation Email to Customer
        string autoReplySubject = "[SEN CloudHost] Xác nhận tiếp nhận yêu cầu tư vấn kỹ thuật";
        string autoReplyHtml = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;'>
                <div style='background: #0f172a; padding: 24px; text-align: center; color: white;'>
                    <div style='font-size: 26px; margin-bottom: 4px;'>🪷</div>
                    <h2 style='margin: 0; font-size: 20px; font-weight: 800;'>SEN CloudHost VN</h2>
                    <p style='margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;'>TIẾP NHẬN YÊU CẦU TƯ VẤN &amp; HỖ TRỢ</p>
                </div>
                <div style='padding: 28px;'>
                    <h3 style='color: #0f172a; margin-top: 0;'>Chào bạn {request.Name},</h3>
                    <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                        Chúng tôi đã nhận được thông tin yêu cầu tư vấn của bạn về chủ đề: <strong>{request.Subject}</strong>.
                    </p>
                    <div style='background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin: 18px 0; font-size: 13px; color: #334155; line-height: 1.6;'>
                        <strong>Nội dung bạn đã gửi:</strong><br/>
                        <span style='color: #64748b;'>{request.Message.Replace("\n", "<br/>")}</span>
                    </div>
                    <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                        Chuyên viên kỹ thuật Level 3 của SEN CloudHost cam kết liên hệ lại với bạn trong vòng <strong>15 phút</strong>.
                    </p>
                    <div style='text-align: center; margin: 24px 0;'>
                        <a href='http://localhost:3000/knowledge-base' 
                           style='background: #0f172a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;'>
                            📚 Xem Trung Tâm Tài Liệu Kỹ Thuật
                        </a>
                    </div>
                </div>
                <div style='background: #f1f5f9; padding: 16px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;'>
                    © SEN CloudHost VN &bull; Hotline: 1900 6868 &bull; Email: support@cloudhost.vn
                </div>
            </div>";

        try {
            await _emailService.SendEmailAsync(request.Email, autoReplySubject, autoReplyHtml);
        } catch { }

        return Ok(new { 
            message = "Đã gửi thông điệp thành công!",
            ticketId = ticket.Id
        });
    }
}

public class ContactRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
