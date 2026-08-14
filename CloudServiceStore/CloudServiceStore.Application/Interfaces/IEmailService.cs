using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
}
