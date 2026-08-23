using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, string? temporaryPassword = null, CancellationToken cancellationToken = default);
    Task SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, CancellationToken cancellationToken = default);
    Task SendPaymentSuccessEmailAsync(string toEmail, string orderId, string serviceName, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken cancellationToken = default);
    Task SendPasswordChangedSecurityAlertAsync(string toEmail, string fullName, CancellationToken cancellationToken = default);
    Task SendVpsProvisionedEmailAsync(string toEmail, string vpsName, string ipAddress, string sshUser, string initialPassword, int sshPort, CancellationToken cancellationToken = default);
    Task SendServiceExpiryReminderEmailAsync(string toEmail, string serviceName, int daysLeft, DateTime expiresAt, CancellationToken cancellationToken = default);
}
