using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

public class LoggingEmailService : IEmailService
{
    private readonly ILogger<LoggingEmailService> _logger;

    public LoggingEmailService(ILogger<LoggingEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Password reset email to {Email}: {ResetLink}", toEmail, resetLink);
        return Task.CompletedTask;
    }
}
