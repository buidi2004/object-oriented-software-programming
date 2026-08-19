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

namespace CloudServiceStore.Infrastructure.Services;

public class GmailEmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<GmailEmailService> _logger;

    public GmailEmailService(IOptions<EmailSettings> settings, ILogger<GmailEmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
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
            // Don't rethrow — email failure should not crash the main business flow
        }
        finally
        {
            await client.DisconnectAsync(true, cancellationToken);
        }
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        var html = WrapInTemplate("Đặt lại mật khẩu", $@"
            <h2 style='color: #1a1a2e; margin-bottom: 16px;'>Yêu cầu đặt lại mật khẩu</h2>
            <p style='color: #555; font-size: 15px; line-height: 1.6;'>
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>CloudHost VN</strong>.
                Nhấn nút bên dưới để tạo mật khẩu mới:
            </p>
            <div style='text-align: center; margin: 32px 0;'>
                <a href='{resetLink}' 
                   style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);'>
                    🔑 Đặt lại mật khẩu
                </a>
            </div>
            <p style='color: #888; font-size: 13px;'>
                Link có hiệu lực trong <strong>1 giờ</strong>. Nếu bạn không yêu cầu, hãy bỏ qua email này.
            </p>");

        await SendEmailAsync(toEmail, "🔐 Đặt lại mật khẩu - CloudHost VN", html, cancellationToken);
    }

    public async Task SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, CancellationToken cancellationToken = default)
    {
        var shortId = orderId.Length > 8 ? orderId[..8].ToUpper() : orderId.ToUpper();
        var html = WrapInTemplate("Xác nhận đơn hàng", $@"
            <h2 style='color: #1a1a2e; margin-bottom: 16px;'>📦 Đơn hàng đã được tạo</h2>
            <div style='background: linear-gradient(135deg, #f0f4ff, #e8ecf8); border-radius: 12px; padding: 24px; margin: 20px 0;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 8px 0; color: #666; font-size: 14px;'>Mã đơn hàng:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 700; color: #1a1a2e; font-size: 16px;'>#{shortId}</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #666; font-size: 14px;'>Tổng thanh toán:</td>
                        <td style='padding: 8px 0; text-align: right; font-weight: 700; color: #e74c3c; font-size: 18px;'>{totalAmount:N0} ₫</td>
                    </tr>
                    <tr>
                        <td style='padding: 8px 0; color: #666; font-size: 14px;'>Trạng thái:</td>
                        <td style='padding: 8px 0; text-align: right;'>
                            <span style='background: #fff3cd; color: #856404; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>⏳ Chờ thanh toán</span>
                        </td>
                    </tr>
                </table>
            </div>
            <p style='color: #555; font-size: 14px; line-height: 1.6;'>
                Vui lòng hoàn tất thanh toán qua mã QR VietQR trên trang thanh toán. 
                Hệ thống sẽ tự động kích hoạt dịch vụ sau khi nhận được tiền.
            </p>");

        await SendEmailAsync(toEmail, $"📦 Đơn hàng #{shortId} đã được tạo - CloudHost VN", html, cancellationToken);
    }

    public async Task SendPaymentSuccessEmailAsync(string toEmail, string orderId, string serviceName, CancellationToken cancellationToken = default)
    {
        var shortId = orderId.Length > 8 ? orderId[..8].ToUpper() : orderId.ToUpper();
        var html = WrapInTemplate("Thanh toán thành công", $@"
            <h2 style='color: #1a1a2e; margin-bottom: 16px;'>🎉 Thanh toán thành công!</h2>
            <div style='background: linear-gradient(135deg, #d4edda, #c3e6cb); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;'>
                <div style='font-size: 48px; margin-bottom: 12px;'>✅</div>
                <p style='color: #155724; font-size: 18px; font-weight: 700; margin: 0;'>Thanh toán đã được xác nhận</p>
                <p style='color: #155724; font-size: 14px; margin: 8px 0 0 0;'>Mã đơn: <strong>#{shortId}</strong></p>
            </div>
            <p style='color: #555; font-size: 15px; line-height: 1.6;'>
                Dịch vụ <strong>{serviceName}</strong> của bạn đang được khởi tạo tự động.
                Bạn có thể theo dõi trạng thái tại trang <strong>Dashboard</strong>.
            </p>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='http://localhost:3000/dashboard' 
                   style='background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;
                          box-shadow: 0 4px 15px rgba(0, 184, 148, 0.4);'>
                    🖥️ Vào Dashboard
                </a>
            </div>");

        await SendEmailAsync(toEmail, $"✅ Thanh toán thành công #{shortId} - CloudHost VN", html, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken cancellationToken = default)
    {
        var html = WrapInTemplate("Chào mừng", $@"
            <h2 style='color: #1a1a2e; margin-bottom: 16px;'>🚀 Chào mừng đến với CloudHost VN!</h2>
            <p style='color: #555; font-size: 15px; line-height: 1.6;'>
                Xin chào <strong>{fullName}</strong>,<br><br>
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>CloudHost VN</strong> — nền tảng Cloud hosting hàng đầu Việt Nam.
            </p>
            <div style='background: linear-gradient(135deg, #f0f4ff, #e8ecf8); border-radius: 12px; padding: 24px; margin: 20px 0;'>
                <h3 style='color: #1a1a2e; margin: 0 0 12px 0; font-size: 16px;'>Bạn có thể:</h3>
                <ul style='color: #555; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;'>
                    <li>☁️ Thuê Cloud VPS hiệu năng cao</li>
                    <li>🌐 Đăng ký tên miền</li>
                    <li>🔒 Mua chứng chỉ SSL</li>
                    <li>🎮 Thuê Game Server</li>
                    <li>💾 Sao lưu dữ liệu tự động</li>
                </ul>
            </div>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='http://localhost:3000/marketplace' 
                   style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);'>
                    🛒 Khám phá dịch vụ ngay
                </a>
            </div>");

        await SendEmailAsync(toEmail, "🚀 Chào mừng bạn đến với CloudHost VN!", html, cancellationToken);
    }

    public async Task SendPasswordChangedSecurityAlertAsync(string toEmail, string fullName, CancellationToken cancellationToken = default)
    {
        var nowStr = DateTime.UtcNow.ToString("HH:mm:ss dd/MM/yyyy") + " (UTC)";
        var html = WrapInTemplate("Cảnh báo bảo mật", $@"
            <h2 style='color: #1a1a2e; margin-bottom: 16px;'>🔐 Cảnh báo bảo mật tài khoản</h2>
            <div style='background: linear-gradient(135deg, #fff3cd, #ffeaa7); border-radius: 12px; padding: 20px; margin: 20px 0;'>
                <p style='color: #856404; font-size: 15px; margin: 0; line-height: 1.6;'>
                    Xin chào <strong>{fullName}</strong>,<br>
                    Mật khẩu tài khoản của bạn tại <strong>CloudHost VN</strong> vừa được thay đổi thành công vào lúc <strong>{nowStr}</strong>.
                </p>
            </div>
            <p style='color: #e74c3c; font-size: 14px; line-height: 1.6; font-weight: 600;'>
                ⚠️ Nếu bạn không thực hiện thay đổi này, hãy liên hệ ngay với đội ngũ hỗ trợ khẩn cấp của chúng tôi để bảo vệ tài khoản.
            </p>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='http://localhost:3000/contact' 
                   style='background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;
                          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);'>
                    🛡️ Liên hệ hỗ trợ khẩn cấp
                </a>
            </div>");

        await SendEmailAsync(toEmail, "🔐 [Cảnh báo] Mật khẩu tài khoản của bạn đã được thay đổi - CloudHost VN", html, cancellationToken);
    }

    public async Task SendVpsProvisionedEmailAsync(string toEmail, string vpsName, string ipAddress, string sshUser, string initialPassword, int sshPort, CancellationToken cancellationToken = default)
    {
        var html = WrapInTemplate("Thông tin máy chủ", $@"
            <h2 style='color: #1a1a2e; margin-bottom: 16px;'>🖥️ Máy chủ Cloud VPS đã sẵn sàng!</h2>
            <p style='color: #555; font-size: 15px; line-height: 1.6;'>
                Dịch vụ <strong>{vpsName}</strong> của bạn đã được khởi tạo và cấu hình hoàn tất. Dưới đây là thông tin đăng nhập:
            </p>
            <div style='background: #1e293b; border-radius: 12px; padding: 24px; margin: 20px 0; color: #f8fafc; font-family: monospace;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>Địa chỉ IP:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #38bdf8; font-size: 15px;'>{ipAddress}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>SSH Port:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #38bdf8; font-size: 15px;'>{sshPort}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>Tài khoản:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #4ade80; font-size: 15px;'>{sshUser}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #94a3b8; font-size: 13px;'>Mật khẩu khởi tạo:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #facc15; font-size: 15px;'>{initialPassword}</td>
                    </tr>
                </table>
                <div style='margin-top: 16px; padding-top: 12px; border-top: 1px solid #334155; font-size: 12px; color: #94a3b8;'>
                    Lệnh kết nối nhanh: <br>
                    <code style='color: #38bdf8; font-size: 13px;'>ssh {sshUser}@{ipAddress} -p {sshPort}</code>
                </div>
            </div>
            <p style='color: #e74c3c; font-size: 13px; line-height: 1.5;'>
                🔒 <em>Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để đảm bảo an toàn.</em>
            </p>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='http://localhost:3000/dashboard/vps' 
                   style='background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: white; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;
                          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);'>
                    🚀 Quản lý VPS tại Dashboard
                </a>
            </div>");

        await SendEmailAsync(toEmail, $"🖥️ Thông tin bàn giao máy chủ {vpsName} - CloudHost VN", html, cancellationToken);
    }

    public async Task SendServiceExpiryReminderEmailAsync(string toEmail, string serviceName, int daysLeft, DateTime expiresAt, CancellationToken cancellationToken = default)
    {
        var expiresAtStr = expiresAt.ToString("dd/MM/yyyy");
        var html = WrapInTemplate("Nhắc nhở gia hạn", $@"
            <h2 style='color: #1a1a2e; margin-bottom: 16px;'>⏰ Dịch vụ của bạn sắp hết hạn</h2>
            <p style='color: #555; font-size: 15px; line-height: 1.6;'>
                Dịch vụ <strong>{serviceName}</strong> sẽ hết hạn sau <strong>{daysLeft} ngày</strong> (ngày {expiresAtStr}).
            </p>
            <div style='background: linear-gradient(135deg, #fff3cd, #feeaa7); border-radius: 12px; padding: 20px; margin: 20px 0;'>
                <p style='color: #856404; font-size: 14px; margin: 0; line-height: 1.6;'>
                    Để tránh gián đoạn dịch vụ và nguy cơ mất dữ liệu, vui lòng gia hạn hoặc nạp tiền vào ví trước ngày hết hạn.
                </p>
            </div>
            <div style='text-align: center; margin: 28px 0;'>
                <a href='http://localhost:3000/dashboard' 
                   style='background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 40px; 
                          text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;
                          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);'>
                    💳 Gia hạn dịch vụ ngay
                </a>
            </div>");

        await SendEmailAsync(toEmail, $"⏰ [Nhắc nhở] Dịch vụ {serviceName} còn {daysLeft} ngày sẽ hết hạn - CloudHost VN", html, cancellationToken);
    }

    private static string WrapInTemplate(string preheader, string bodyContent)
    {
        return $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{preheader} - CloudHost VN</title>
</head>
<body style='margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif;'>
    <!-- Preheader text (hidden, for email preview) -->
    <span style='display: none; max-height: 0; overflow: hidden;'>{preheader}</span>
    
    <table role='presentation' cellpadding='0' cellspacing='0' width='100%' style='background-color: #f4f6f9;'>
        <tr>
            <td align='center' style='padding: 40px 16px;'>
                <table role='presentation' cellpadding='0' cellspacing='0' width='600' style='max-width: 600px; width: 100%;'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;'>
                            <h1 style='margin: 0; color: white; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;'>
                                ☁️ CloudHost <span style='color: #60a5fa;'>VN</span>
                            </h1>
                            <p style='margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;'>Enterprise Cloud Solutions</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style='background: white; padding: 40px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;'>
                            {bodyContent}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style='background: #f8fafc; padding: 24px 40px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none; text-align: center;'>
                            <p style='margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;'>
                                © {DateTime.UtcNow.Year} CloudHost VN — Nền tảng Cloud hosting hàng đầu Việt Nam
                            </p>
                            <p style='margin: 0; color: #cbd5e1; font-size: 11px;'>
                                Email này được gửi tự động, vui lòng không trả lời trực tiếp.
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
