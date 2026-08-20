using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace CloudServiceStore.Infrastructure.Services;

public class DockerGameServerProvisioningService : IGameServerProvisioningService
{
    private readonly ILogger<DockerGameServerProvisioningService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    public DockerGameServerProvisioningService(ILogger<DockerGameServerProvisioningService> logger)
    {
        _logger = logger;
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning($"Lỗi tạo Game Server (Lần {retryCount}). Thử lại sau {timeSpan.TotalSeconds}s. Lỗi: {exception.Message}");
                });
    }

    public async Task<int> ProvisionGameServerAsync(GameServerInstance instance, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation($"Bắt đầu kéo image và cấp phát Game Server {instance.GameType} - {instance.ServerName}...");

                // Giả lập network delay lớn vì image game server thường rất nặng
                await Task.Delay(3000, cancellationToken);

                if (new Random().Next(0, 10) < 3)
                {
                    throw new InvalidOperationException("Docker daemon timeout khi pull image.");
                }

                _logger.LogInformation($"Tạo Game Server {instance.ServerName} thành công!");

                return new Random().Next(25565, 27015);
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Thất bại tạo Game Server {instance.ServerName} sau 3 lần thử. Lỗi: {ex.Message}");
            return -1;
        }
    }
}
