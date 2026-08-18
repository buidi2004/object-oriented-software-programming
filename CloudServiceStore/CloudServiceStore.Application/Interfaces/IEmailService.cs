using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
    Task SendOrderConfirmationEmailAsync(string toEmail, string orderId, decimal totalAmount, CancellationToken cancellationToken = default);
    Task SendPaymentSuccessEmailAsync(string toEmail, string orderId, string serviceName, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string toEmail, string fullName, CancellationToken cancellationToken = default);
}
