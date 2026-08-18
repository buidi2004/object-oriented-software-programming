using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

/// <summary>
/// Fallback email service that only logs — used when Gmail SMTP is not configured.
/// </summary>
public class LoggingEmailService : IEmailService
{
    private readonly ILogger<LoggingEmailService> _logger;

    public LoggingEmailService(ILogger<LoggingEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL-LOG] To: {Email} | Subject: {Subject} | Body length: {Length}", toEmail, subject, htmlBody.Length);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL-LOG] Password reset email to {Email}: {ResetLink}", toEmail, resetLink);
        return Task.CompletedTask;
    }

    public Task SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL-LOG] Order confirmation to {Email}: Order {OrderId}, Amount {Amount}", toEmail, orderId, totalAmount);
        return Task.CompletedTask;
    }

    public Task SendPaymentSuccessEmailAsync(string toEmail, string orderId, string serviceName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL-LOG] Payment success to {Email}: Order {OrderId}, Service {Service}", toEmail, orderId, serviceName);
        return Task.CompletedTask;
    }

    public Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL-LOG] Welcome email to {Email}: {FullName}", toEmail, fullName);
        return Task.CompletedTask;
    }
}
