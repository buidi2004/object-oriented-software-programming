using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace CloudServiceStore.Infrastructure.Services;

public class CloudflareCdnProvisioningService : ICdnProvisioningService
{
    private readonly ILogger<CloudflareCdnProvisioningService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    public CloudflareCdnProvisioningService(ILogger<CloudflareCdnProvisioningService> logger)
    {
        _logger = logger;
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning($"Lỗi gọi Cloudflare API (Lần {retryCount}). Thử lại sau {timeSpan.TotalSeconds}s. Lỗi: {exception.Message}");
                });
    }

    public async Task<string> CreateDistributionAsync(CdnDistribution distribution, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation($"Bắt đầu gọi Cloudflare API tạo Zone cho Origin {distribution.OriginUrl}...");

                // Giả lập network call to Cloudflare API
                await Task.Delay(2000, cancellationToken);

                // Giả lập timeout ngẫu nhiên 30% để test Polly Retry
                if (new Random().Next(0, 10) < 3)
                {
                    throw new InvalidOperationException("Cloudflare API Gateway Timeout (504).");
                }

                _logger.LogInformation($"Tạo CdnDistribution trên Cloudflare thành công!");

                return $"cdn-{Guid.NewGuid().ToString().Substring(0, 8)}.cloudservicestore.net";
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Thất bại gọi Cloudflare API sau 3 lần thử. Lỗi: {ex.Message}");
            return string.Empty;
        }
    }
}
