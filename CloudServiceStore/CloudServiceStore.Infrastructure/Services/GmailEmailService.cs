using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using CloudServiceStore.Infrastructure.Configuration;
using CloudServiceStore.Application.Messages;

namespace CloudServiceStore.Infrastructure.Services;

public class GmailEmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<GmailEmailService> _logger;
    private readonly string _frontendBaseUrl;
    private readonly RabbitMQSettings _rabbitSettings;
    private readonly IRabbitMQPublisher _rabbitPublisher;

    public GmailEmailService(IOptions<EmailSettings> settings, ILogger<GmailEmailService> logger, IOptions<FrontendSettings> frontendOptions, IOptions<RabbitMQSettings> rabbitOptions, IRabbitMQPublisher rabbitPublisher)
    {
        _settings = settings.Value;
        _logger = logger;
        _frontendBaseUrl = (frontendOptions?.Value?.BaseUrl ?? "http://localhost:3000").TrimEnd('/');
        _rabbitSettings = rabbitOptions?.Value ?? new RabbitMQSettings();
        _rabbitPublisher = rabbitPublisher;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            _logger.LogInformation("✅ Email sent to {ToEmail} | Subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send email to {ToEmail} | Subject: {Subject}", toEmail, subject);
        }
        finally
        {
            if (client.IsConnected)
            {
                try
                {
                    await client.DisconnectAsync(true, cancellationToken);
                }
                catch { }
            }
        }
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, string? temporaryPassword = null, CancellationToken cancellationToken = default)
    {
        var passwordBlock = string.IsNullOrWhiteSpace(temporaryPassword) ? "" : $@"
            <div style='background: #0f172a; color: #ffffff; border-radius: 12px; padding: 22px; margin: 20px 0; text-align: center;'>
                <p style='color: #94a3b8; font-size: 12px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;'>
                    Mật Khẩu Mới Của Bạn:
                </p>
                <div style='font-family: monospace; font-size: 24px; font-weight: 800; color: #38bdf8; letter-spacing: 3px; padding: 10px 20px; background: rgba(255,255,255,0.08); border-radius: 8px; display: inline-block;'>
                    {temporaryPassword}
                </div>
                <p style='color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;'>
                    Bạn có thể copy và sử dụng mật khẩu này để đăng nhập ngay vào hệ thống.
                </p>
            </div>
            <div style='text-align: center; margin: 24px 0;'>
                <a href='{_frontendBaseUrl}/?auth=login' 
                   style='background: #0f172a; color: #ffffff; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; border: 1px solid #334155;'>
                    🚀 Đăng Nhập Với Mật Khẩu Này
                </a>
            </div>";

        var html = WrapInTemplate("Cấp lại mật khẩu tài khoản", $@"
            <h2 style='color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 800;'>🔐 Khôi Phục &amp; Cấp Mật Khẩu Mới</h2>
            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản <strong>{toEmail}</strong> tại <strong>SEN CloudHost</strong>.
            </p>
            {passwordBlock}
            <div style='background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin-top: 20px;'>
                <p style='margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;'>
                    Hoặc bạn có thể tự thiết lập mật khẩu tùy chọn mới theo ý muốn qua liên kết bảo mật (có hiệu lực trong 1 giờ):<br/>
                    <a href='{resetLink}' style='color: #0284c7; font-weight: 700; text-decoration: none;'>👉 Nhấp vào đây để đổi mật khẩu theo ý bạn</a>
                </p>
            </div>
            <p style='color: #94a3b8; font-size: 12px; margin-top: 20px;'>
                Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ ngay với Hotline 1900 6868 để được hỗ trợ bảo vệ tài khoản.
            </p>");

        var msg = new NotificationEmailMessage { ToEmail = toEmail, Subject = "🔐 [SEN CloudHost] Khôi phục và cấp mật khẩu mới của bạn", HtmlBody = html };
        _rabbitPublisher.Publish(_rabbitSettings.Queues.Notification, msg);
        await Task.CompletedTask;
    }

    public async Task SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, CancellationToken cancellationToken = default)
    {
        var shortId = orderId.Length > 8 ? orderId[..8].ToUpper() : orderId.ToUpper();
        var html = WrapInTemplate("Xác nhận đơn hàng", $@"
            <h2 style='color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 800;'>📦 Đơn Hàng Mới Đã Được Tạo</h2>
            <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Mã đơn hàng:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 800; color: #0f172a; font-size: 15px; font-family: monospace;'>#{shortId}</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Tổng thanh toán:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 800; color: #0f172a; font-size: 18px;'>{totalAmount:N0} ₫</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #64748b; font-size: 14px;'>Trạng thái:</td>
                        <td style='padding: 8px 0; text-align: right;'>
                            <span style='background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;'>⏳ Chờ thanh toán</span>
                        </td>
                    </tr>
                </table>
            </div>
            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                Vui lòng hoàn tất thanh toán để hệ thống tự động khởi tạo dịch vụ đám mây cho bạn trong 30 giây.
            </p>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='{_frontendBaseUrl}/dashboard/orders' 
                   style='background: #0f172a; color: #ffffff; padding: 14px 36px; 
                          text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;'>
                    💳 Thanh Toán &amp; Xem Chi Tiết Đơn Hàng
                </a>
            </div>");

        var msg = new NotificationEmailMessage { ToEmail = toEmail, Subject = $"📦 Đơn hàng #{shortId} đã được tạo - SEN CloudHost", HtmlBody = html };
        _rabbitPublisher.Publish(_rabbitSettings.Queues.Notification, msg);
        await Task.CompletedTask;
    }

    public async Task SendPaymentSuccessEmailAsync(string toEmail, string orderId, string serviceName, CancellationToken cancellationToken = default)
    {
        var shortId = orderId.Length > 8 ? orderId[..8].ToUpper() : orderId.ToUpper();
        var html = WrapInTemplate("Thanh toán thành công", $@"
            <h2 style='color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 800;'>🎉 Thanh Toán Đơn Hàng Thành Công!</h2>
            
            <div style='background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;'>
                <div style='font-size: 40px; margin-bottom: 8px;'>✅</div>
                <p style='color: #0f172a; font-size: 18px; font-weight: 800; margin: 0;'>Thanh toán đã được xác nhận</p>
                <p style='color: #475569; font-size: 14px; margin: 6px 0 0 0;'>Mã đơn hàng: <strong style='font-family: monospace; color: #0f172a;'>#{shortId}</strong></p>
            </div>

            <p style='color: #334155; font-size: 14px; line-height: 1.6;'>
                Dịch vụ <strong>{serviceName}</strong> (Đơn #{shortId}) của bạn đang được hệ thống tự động khởi tạo. Bạn có thể truy cập các đường dẫn bên dưới để quản trị dịch vụ:
            </p>

            <div style='text-align: center; margin: 28px 0;'>
                <a href='{_frontendBaseUrl}/dashboard' 
                   style='background: #0f172a; color: #ffffff; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;'>
                    🖥️ Vào Trang Quản Trị Dashboard
                </a>
            </div>

            <!-- Direct Quick Action Links -->
            <div style='background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin-top: 20px;'>
                <p style='margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a;'>Liên kết truy cập nhanh cho bạn:</p>
                <ul style='margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;'>
                    <li><a href='{_frontendBaseUrl}/dashboard/vps-instances' style='color: #0284c7; font-weight: 600; text-decoration: none;'>☁️ Danh sách máy chủ VPS đang hoạt động</a></li>
                    <li><a href='{_frontendBaseUrl}/dashboard/invoices' style='color: #0284c7; font-weight: 600; text-decoration: none;'>🧾 Xem và tải hóa đơn điện tử (VAT)</a></li>
                    <li><a href='{_frontendBaseUrl}/knowledge-base' style='color: #0284c7; font-weight: 600; text-decoration: none;'>📚 Hướng dẫn kết nối SSH &amp; Cài đặt Web Server</a></li>
                    <li><a href='{_frontendBaseUrl}/contact' style='color: #0284c7; font-weight: 600; text-decoration: none;'>📞 Liên hệ đội ngũ kỹ sư trực tuyến 24/7</a></li>
                </ul>
            </div>");

        var msg = new NotificationEmailMessage { ToEmail = toEmail, Subject = $"✅ Thanh toán thành công #{shortId} - SEN CloudHost", HtmlBody = html };
        _rabbitPublisher.Publish(_rabbitSettings.Queues.Notification, msg);
        await Task.CompletedTask;
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken cancellationToken = default)
    {
        var html = WrapInTemplate("Chào mừng bạn", $@"
            <h2 style='color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 800;'>🚀 Chào Mừng Đến Với SEN CloudHost!</h2>
            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                Xin chào <strong>{fullName}</strong>,<br><br>
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>SEN CloudHost</strong> — nền tảng Điện toán đám mây &amp; Trung tâm dữ liệu tốc độ cao hàng đầu Việt Nam.
            </p>
            <div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;'>
                <h3 style='color: #0f172a; margin: 0 0 10px 0; font-size: 14px; font-weight: 700;'>Hệ sinh thái dịch vụ sẵn sàng cho bạn:</h3>
                <ul style='color: #475569; font-size: 13px; line-height: 1.9; padding-left: 20px; margin: 0;'>
                    <li>☁️ <strong>Cloud VPS NVMe</strong> — Khởi tạo tự động trong 30 giây</li>
                    <li>🌐 <strong>Tên Miền &amp; DNS</strong> — Đăng ký &amp; phân giải tức thì</li>
                    <li>🔒 <strong>Chứng chỉ SSL Doanh Nghiệp</strong> — Bảo mật cấp cao</li>
                    <li>🎮 <strong>Game Server</strong> — Chống DDoS 500Gbps chuyên dụng</li>
                    <li>💾 <strong>Object Storage S3</strong> — Lưu trữ an toàn, mở rộng không giới hạn</li>
                </ul>
            </div>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='{_frontendBaseUrl}/services' 
                   style='background: #0f172a; color: #ffffff; padding: 14px 36px; 
                          text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;'>
                    🛒 Khám Phá Bảng Giá Dịch Vụ Ngay
                </a>
            </div>");

        var msg = new NotificationEmailMessage { ToEmail = toEmail, Subject = "🚀 Chào mừng bạn đến với SEN CloudHost!", HtmlBody = html };
        _rabbitPublisher.Publish(_rabbitSettings.Queues.Notification, msg);
        await Task.CompletedTask;
    }

    public async Task SendPasswordChangedSecurityAlertAsync(string toEmail, string fullName, CancellationToken cancellationToken = default)
    {
        var nowStr = DateTime.UtcNow.ToString("HH:mm:ss dd/MM/yyyy") + " (UTC)";
        var html = WrapInTemplate("Cảnh báo bảo mật", $@"
            <h2 style='color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 800;'>🔐 Cảnh Báo Bảo Mật Tài Khoản</h2>
            <div style='background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0;'>
                <p style='color: #991b1b; font-size: 14px; margin: 0; line-height: 1.6;'>
                    Xin chào <strong>{fullName}</strong>,<br>
                    Mật khẩu tài khoản của bạn tại <strong>SEN CloudHost</strong> vừa được thay đổi thành công vào lúc <strong>{nowStr}</strong>.
                </p>
            </div>
            <p style='color: #b91c1c; font-size: 13px; line-height: 1.6; font-weight: 600;'>
                ⚠️ Nếu bạn không thực hiện thay đổi này, tài khoản của bạn có thể đã bị truy cập trái phép. Hãy liên hệ ngay với đội ngũ hỗ trợ khẩn cấp:
            </p>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='{_frontendBaseUrl}/contact' 
                   style='background: #0f172a; color: #ffffff; padding: 14px 36px; 
                          text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;'>
                    🛡️ Liên Hệ Hỗ Trợ Khẩn Cấp (1900 6868)
                </a>
            </div>");

        var msg = new NotificationEmailMessage { ToEmail = toEmail, Subject = "🔐 [Cảnh báo] Mật khẩu tài khoản đã thay đổi - SEN CloudHost", HtmlBody = html };
        _rabbitPublisher.Publish(_rabbitSettings.Queues.Notification, msg);
        await Task.CompletedTask;
    }

    public async Task SendVpsProvisionedEmailAsync(string toEmail, string vpsName, string ipAddress, string sshUser, string initialPassword, int sshPort, CancellationToken cancellationToken = default)
    {
        var html = WrapInTemplate("Thông tin máy chủ", $@"
            <h2 style='color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 800;'>🖥️ Máy Chủ Cloud VPS Đã Sẵn Sàng!</h2>
            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                Dịch vụ <strong>{vpsName}</strong> của bạn đã được hệ thống KVM ảo hóa khởi tạo hoàn tất. Dưới đây là thông tin đăng nhập máy chủ:
            </p>
            <div style='background: #0f172a; border-radius: 12px; padding: 24px; margin: 20px 0; color: #f8fafc; font-family: monospace;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>Địa chỉ IPv4:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #38bdf8; font-size: 15px;'>{ipAddress}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>Cổng SSH:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #38bdf8; font-size: 15px;'>{sshPort}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>Tài khoản:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #4ade80; font-size: 15px;'>{sshUser}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>Mật khẩu Root:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #facc15; font-size: 15px;'>{initialPassword}</td>
                    </tr>
                </table>
                <div style='margin-top: 16px; padding-top: 12px; border-top: 1px solid #334155; font-size: 12px; color: #94a3b8;'>
                    Lệnh kết nối SSH nhanh: <br>
                    <code style='color: #38bdf8; font-size: 13px; font-weight: bold;'>ssh {sshUser}@{ipAddress} -p {sshPort}</code>
                </div>
            </div>
            <p style='color: #b91c1c; font-size: 13px; line-height: 1.5;'>
                🔒 <em>Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để đảm bảo an toàn tuyệt đối.</em>
            </p>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='{_frontendBaseUrl}/dashboard/vps-instances' 
                   style='background: #0f172a; color: #ffffff; padding: 14px 36px; 
                          text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;'>
                    🚀 Quản Lý Máy Chủ Tại Dashboard
                </a>
            </div>
            <div style='text-align: center;'>
                <a href='{_frontendBaseUrl}/knowledge-base' style='color: #0284c7; font-size: 13px; text-decoration: none; font-weight: 600;'>
                    📚 Xem tài liệu hướng dẫn bảo mật &amp; cài đặt Nginx/Docker
                </a>
            </div>");

        var msg = new NotificationEmailMessage { ToEmail = toEmail, Subject = $"🖥️ Thông tin bàn giao máy chủ {vpsName} - SEN CloudHost", HtmlBody = html };
        _rabbitPublisher.Publish(_rabbitSettings.Queues.Notification, msg);
        await Task.CompletedTask;
    }

    public async Task SendServiceExpiryReminderEmailAsync(string toEmail, string serviceName, int daysLeft, DateTime expiresAt, CancellationToken cancellationToken = default)
    {
        var expiresAtStr = expiresAt.ToString("dd/MM/yyyy");
        var html = WrapInTemplate("Nhắc nhở gia hạn", $@"
            <h2 style='color: #0f172a; margin-bottom: 16px; font-size: 20px; font-weight: 800;'>⏰ Dịch Vụ Của Bạn Sắp Hết Hạn</h2>
            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>
                Dịch vụ <strong>{serviceName}</strong> sẽ hết hạn sau <strong>{daysLeft} ngày</strong> (vào ngày {expiresAtStr}).
            </p>
            <div style='background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin: 20px 0;'>
                <p style='color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;'>
                    Để tránh gián đoạn website và rủi ro gián đoạn dịch vụ, vui lòng gia hạn hoặc nạp tiền vào ví trước ngày hết hạn.
                </p>
            </div>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='{_frontendBaseUrl}/dashboard/orders' 
                   style='background: #0f172a; color: #ffffff; padding: 14px 36px; 
                          text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;'>
                    💳 Gia Hạn Dịch Vụ Ngay
                </a>
            </div>");

        var msg = new NotificationEmailMessage { ToEmail = toEmail, Subject = $"⏰ [Nhắc nhở] Dịch vụ {serviceName} còn {daysLeft} ngày sẽ hết hạn - SEN CloudHost", HtmlBody = html };
        _rabbitPublisher.Publish(_rabbitSettings.Queues.Notification, msg);
        await Task.CompletedTask;
    }

    private string WrapInTemplate(string preheader, string bodyContent)
    {
        return $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{preheader} - SEN CloudHost VN</title>
</head>
<body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif;'>
    <span style='display: none; max-height: 0; overflow: hidden;'>{preheader}</span>
    
    <table role='presentation' cellpadding='0' cellspacing='0' width='100%' style='background-color: #f8fafc;'>
        <tr>
            <td align='center' style='padding: 40px 16px;'>
                <table role='presentation' cellpadding='0' cellspacing='0' width='600' style='max-width: 600px; width: 100%;'>
                    
                    <!-- Header with Lotus Flower Logo -->
                    <tr>
                        <td style='background: #ffffff; padding: 28px 32px; border-radius: 16px 16px 0 0; text-align: center; border-bottom: 1px solid #e2e8f0;'>
                            <div style='margin-bottom: 6px;'>
                                <img src='{_frontendBaseUrl}/images/logo.png' alt='SEN CloudHost VN' style='height: 48px; width: auto; max-width: 100%; object-fit: contain;' />
                            </div>
                            <p style='margin: 0; color: #64748b; font-size: 11px; font-weight: 600; letter-spacing: 0.8px;'>
                                NỀN TẢNG ĐIỆN TOÁN ĐÁM MÂY CHUẨN DOANH NGHIỆP
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style='background: #ffffff; padding: 36px 32px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;'>
                            {bodyContent}
                        </td>
                    </tr>

                    <!-- Footer with Links for Customer -->
                    <tr>
                        <td style='background: #f1f5f9; padding: 24px 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none; text-align: center;'>
                            <div style='margin-bottom: 12px; font-size: 12px; font-weight: 600;'>
                                <a href='{_frontendBaseUrl}' style='color: #0f172a; text-decoration: none; margin: 0 8px;'>Trang chủ</a> &bull;
                                <a href='{_frontendBaseUrl}/services' style='color: #0f172a; text-decoration: none; margin: 0 8px;'>Dịch vụ</a> &bull;
                                <a href='{_frontendBaseUrl}/knowledge-base' style='color: #0f172a; text-decoration: none; margin: 0 8px;'>Tài liệu</a> &bull;
                                <a href='{_frontendBaseUrl}/contact' style='color: #0f172a; text-decoration: none; margin: 0 8px;'>Liên hệ</a> &bull;
                                <a href='{_frontendBaseUrl}/careers' style='color: #0f172a; text-decoration: none; margin: 0 8px;'>Tuyển dụng</a>
                            </div>
                            <p style='margin: 0 0 6px 0; color: #64748b; font-size: 11px;'>
                                © {DateTime.UtcNow.Year} SEN CloudHost VN &bull; Hotline: 1900 6868 &bull; Email: support@cloudhost.vn
                            </p>
                            <p style='margin: 0; color: #94a3b8; font-size: 10px;'>
                                Email này được gửi tự động từ hệ thống SEN CloudHost.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
