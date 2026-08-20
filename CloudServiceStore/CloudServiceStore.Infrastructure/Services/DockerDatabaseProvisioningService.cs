using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace CloudServiceStore.Infrastructure.Services;

public class DockerDatabaseProvisioningService : IDatabaseProvisioningService
{
    private readonly ILogger<DockerDatabaseProvisioningService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    public DockerDatabaseProvisioningService(ILogger<DockerDatabaseProvisioningService> logger)
    {
        _logger = logger;
        // Exponential backoff retry policy
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning($"Lỗi tạo Database qua Docker (Lần {retryCount}). Thử lại sau {timeSpan.TotalSeconds}s. Lỗi: {exception.Message}");
                });
    }

    public async Task<int> ProvisionDatabaseAsync(ManagedDatabaseInstance instance, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation($"Bắt đầu cấp phát Database {instance.Engine} - {instance.Name} qua Docker...");

                // Giả lập network delay / pull image
                await Task.Delay(2500, cancellationToken);

                // Giả lập lỗi Docker API
                if (new Random().Next(0, 10) < 3)
                {
                    throw new InvalidOperationException("Docker daemon connection timeout");
                }

                _logger.LogInformation($"Tạo Database {instance.Name} thành công!");

                // Giả lập trả về một port ngẫu nhiên
                return new Random().Next(30000, 32000);
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Thất bại tạo Database {instance.Name} sau 3 lần thử. Lỗi: {ex.Message}");
            return -1; // -1 indicates failure
        }
    }
}
