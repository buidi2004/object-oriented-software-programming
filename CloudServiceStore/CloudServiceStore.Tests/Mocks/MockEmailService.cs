using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Tests.Mocks;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT to {ToEmail} | Subject: {Subject}", toEmail, subject);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT: Password Reset to {ToEmail}", toEmail);
        return Task.CompletedTask;
    }

    public Task SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT: Order Confirmation to {ToEmail} for Order {OrderId}", toEmail, orderId);
        return Task.CompletedTask;
    }

    public Task SendPaymentSuccessEmailAsync(string toEmail, string orderId, string serviceName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT: Payment Success to {ToEmail} for Order {OrderId}", toEmail, orderId);
        return Task.CompletedTask;
    }

    public Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT: Welcome to {ToEmail}", toEmail);
        return Task.CompletedTask;
    }

    public Task SendPasswordChangedSecurityAlertAsync(string toEmail, string fullName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT: Password Changed Alert to {ToEmail}", toEmail);
        return Task.CompletedTask;
    }

    public Task SendVpsProvisionedEmailAsync(string toEmail, string vpsName, string ipAddress, string sshUser, string initialPassword, int sshPort, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT: VPS Provisioned to {ToEmail} for VPS {VpsName}", toEmail, vpsName);
        return Task.CompletedTask;
    }

    public Task SendServiceExpiryReminderEmailAsync(string toEmail, string serviceName, int daysLeft, DateTime expiresAt, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("MOCK EMAIL SENT: Expiry Reminder to {ToEmail} for Service {ServiceName}", toEmail, serviceName);
        return Task.CompletedTask;
    }
}
