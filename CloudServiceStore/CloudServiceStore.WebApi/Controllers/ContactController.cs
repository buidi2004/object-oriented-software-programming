using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IEmailService _emailService;

    public ContactController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitContactForm([FromBody] ContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Email và nội dung không được để trống." });
        }

        string subject = $"[Website Contact] {request.Subject} - {request.Name}";
        string htmlMessage = $@"
            <h2>Yêu cầu tư vấn mới từ khách hàng vãng lai</h2>
            <p><strong>Họ tên:</strong> {request.Name}</p>
            <p><strong>Email:</strong> {request.Email}</p>
            <p><strong>Số điện thoại:</strong> {request.Phone}</p>
            <p><strong>Chủ đề quan tâm:</strong> {request.Subject}</p>
            <p><strong>Nội dung:</strong></p>
            <blockquote>{request.Message.Replace("\n", "<br/>")}</blockquote>
        ";

        // Gửi email cho Admin (hoặc bộ phận Sale/Support)
        await _emailService.SendEmailAsync("admin@cloudservicestore.com", subject, htmlMessage);

        // Có thể gửi thêm email phản hồi tự động cho khách hàng
        string autoReplySubject = "Xác nhận yêu cầu tư vấn - CloudHost VN";
        string autoReplyHtml = $@"
            <h3>Chào {request.Name},</h3>
            <p>Chúng tôi đã nhận được yêu cầu tư vấn của bạn về chủ đề: <strong>{request.Subject}</strong>.</p>
            <p>Chuyên viên của CloudHost VN sẽ liên hệ lại với bạn trong thời gian sớm nhất qua số điện thoại hoặc email này.</p>
            <p>Nội dung bạn đã gửi:</p>
            <blockquote>{request.Message.Replace("\n", "<br/>")}</blockquote>
            <p>Trân trọng,<br/>Đội ngũ CloudHost VN</p>
        ";
        await _emailService.SendEmailAsync(request.Email, autoReplySubject, autoReplyHtml);

        return Ok(new { message = "Đã gửi thông điệp thành công!" });
    }
}

public class ContactRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
