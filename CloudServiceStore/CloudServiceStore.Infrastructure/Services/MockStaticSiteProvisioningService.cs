using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace CloudServiceStore.Infrastructure.Services;

public class MockStaticSiteProvisioningService : IStaticSiteProvisioningService
{
    private readonly ILogger<MockStaticSiteProvisioningService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    public MockStaticSiteProvisioningService(ILogger<MockStaticSiteProvisioningService> logger)
    {
        _logger = logger;
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning($"Lỗi kết nối CI/CD (Lần {retryCount}). Thử lại sau {timeSpan.TotalSeconds}s. Lỗi: {exception.Message}");
                });
    }

    public async Task<bool> ProvisionProjectAsync(StaticSite staticSite, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation($"Bắt đầu setup workspace cho Static Site '{staticSite.Name}'...");

                // Giả lập call API tới Vercel/Netlify
                await Task.Delay(2000, cancellationToken);

                // Giả lập lỗi API timeout
                if (new Random().Next(0, 10) < 3)
                {
                    throw new InvalidOperationException("API timeout từ nền tảng CI/CD.");
                }

                _logger.LogInformation($"Setup workspace cho Static Site thành công!");

                return true;
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Thất bại tạo Project sau 3 lần thử. Lỗi: {ex.Message}");
            return false;
        }
    }
}
