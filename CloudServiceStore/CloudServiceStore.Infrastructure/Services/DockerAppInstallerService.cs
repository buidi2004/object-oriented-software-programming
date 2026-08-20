using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace CloudServiceStore.Infrastructure.Services;

public class DockerAppInstallerService : IAppInstallerService
{
    private readonly ILogger<DockerAppInstallerService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    public DockerAppInstallerService(ILogger<DockerAppInstallerService> logger)
    {
        _logger = logger;
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning($"Lỗi cài đặt App (Lần {retryCount}). Thử lại sau {timeSpan.TotalSeconds}s. Lỗi: {exception.Message}");
                });
    }

    public async Task<string> InstallAppAsync(AppInstallation installation, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation($"Bắt đầu cài đặt App Template ID {installation.TemplateId} trên VPS {installation.HostingAccountId}...");

                // Giả lập network delay lớn vì pull image và setup DB rất nặng
                await Task.Delay(3000, cancellationToken);

                if (new Random().Next(0, 10) < 3)
                {
                    throw new InvalidOperationException("Docker daemon timeout khi pull image.");
                }

                _logger.LogInformation($"Cài đặt App thành công!");

                return $"http://app-{Guid.NewGuid().ToString().Substring(0, 8)}.cloudservicestore.com";
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Thất bại cài đặt App sau 3 lần thử. Lỗi: {ex.Message}");
            return string.Empty;
        }
    }
}
