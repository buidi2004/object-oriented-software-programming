using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.AddMessage;

public class AddTicketMessageCommandHandler : IRequestHandler<AddTicketMessageCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly IRepository<TicketMessage> _messageRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly IRepository<AppUser> _userRepo;

    public AddTicketMessageCommandHandler(
        IUnitOfWork uow,
        IRepository<SupportTicket> ticketRepo,
        IRepository<TicketMessage> messageRepo,
        ICurrentUserService currentUser,
        IEmailService emailService,
        IRepository<AppUser> userRepo)
    {
        _uow = uow;
        _ticketRepo = ticketRepo;
        _messageRepo = messageRepo;
        _currentUser = currentUser;
        _emailService = emailService;
        _userRepo = userRepo;
    }

    public async Task<Guid> Handle(AddTicketMessageCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var ticket = await _ticketRepo.GetByIdAsync(request.TicketId, ct)
            ?? throw new NotFoundException($"Ticket {request.TicketId} không tồn tại.");

        ticket.AddMessage(userId, request.Message, request.AttachmentUrl); // Domain logic throws if closed
        
        var message = ticket.Messages.Last();
        await _messageRepo.AddAsync(message, ct);

        await _uow.SaveChangesAsync(ct);

        // --- Send Email Notifications ---
        try
        {
            var sender = await _userRepo.GetByIdAsync(userId, ct);
            var shortId = ticket.Id.ToString().Substring(0, 8);
            var frontendUrl = "http://localhost:3000";
            var ticketUrl = $"{frontendUrl}/tickets/{ticket.Id}";

            if (userId != ticket.UserId)
            {
                // Admin/Staff replies to Customer -> Send email to customer
                var customer = await _userRepo.GetByIdAsync(ticket.UserId, ct);
                if (customer != null && !string.IsNullOrWhiteSpace(customer.Email))
                {
                    var emailSubject = $"[Phản hồi Support Ticket #{shortId}] {ticket.Subject}";
                    var emailBody = $@"
                        <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;"">
                            <h2 style=""color: #2563eb;"">CloudHost VN - Hỗ Trợ Khách Hàng</h2>
                            <p>Xin chào <strong>{customer.FullName ?? customer.Email}</strong>,</p>
                            <p>Yêu cầu hỗ trợ <strong>#{shortId}</strong> của bạn vừa có phản hồi mới từ bộ phận Kỹ thuật ({sender?.FullName ?? "Kỹ thuật viên"}):</p>
                            <div style=""padding: 15px; border-left: 4px solid #2563eb; background-color: #f8fafc; margin: 15px 0; border-radius: 4px; line-height: 1.6;"">
                                {request.Message.Replace("\n", "<br/>")}
                            </div>
                            <p>Vui lòng bấm vào liên kết bên dưới để xem chi tiết hoặc tiếp tục trao đổi:</p>
                            <p><a href=""{ticketUrl}"" style=""display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;"">Xem Phản Hồi Ticket</a></p>
                            <hr style=""border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"" />
                            <p style=""font-size: 12px; color: #64748b;"">Trân trọng,<br/>Đội ngũ Hỗ trợ Kỹ thuật CloudHost VN</p>
                        </div>";
                    await _emailService.SendEmailAsync(customer.Email, emailSubject, emailBody);
                }
            }
            else
            {
                // Customer replies on Ticket -> Send notification email to support
                var emailSubject = $"[Khách hàng phản hồi Ticket #{shortId}] {ticket.Subject}";
                var emailBody = $@"
                    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;"">
                        <h2 style=""color: #0284c7;"">Thông Báo Phản Hồi Ticket Mới</h2>
                        <p>Khách hàng <strong>{sender?.FullName ?? sender?.Email}</strong> vừa gửi tin nhắn mới cho Ticket <strong>#{shortId}</strong>:</p>
                        <div style=""padding: 15px; border-left: 4px solid #0284c7; background-color: #f8fafc; margin: 15px 0; border-radius: 4px; line-height: 1.6;"">
                            {request.Message.Replace("\n", "<br/>")}
                        </div>
                        <p><a href=""{frontendUrl}/tickets/{ticket.Id}"" style=""display: inline-block; padding: 10px 20px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;"">Mở Ticket Để Trả Lời</a></p>
                    </div>";
                await _emailService.SendEmailAsync("buidi7170@gmail.com", emailSubject, emailBody);
            }
        }
        catch
        {
            // Email dispatch failure should not block message persistence
        }

        return message.Id;
    }
}
