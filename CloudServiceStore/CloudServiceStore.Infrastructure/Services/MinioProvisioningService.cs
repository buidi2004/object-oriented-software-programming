using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace CloudServiceStore.Infrastructure.Services;

public class MinioProvisioningService : IMinioProvisioningService
{
    private readonly ILogger<MinioProvisioningService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    public MinioProvisioningService(ILogger<MinioProvisioningService> logger)
    {
        _logger = logger;
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning($"Lỗi kết nối MinIO (Lần {retryCount}). Thử lại sau {timeSpan.TotalSeconds}s. Lỗi: {exception.Message}");
                });
    }

    public async Task<bool> CreateBucketAsync(string bucketName, string region, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation($"Gửi yêu cầu tạo bucket '{bucketName}' ở region '{region}' tới MinIO...");

                // Giả lập network delay / quá trình tạo thực tế
                await Task.Delay(2000, cancellationToken);

                // Giả lập 30% lỗi rớt mạng để kiểm tra Polly Retry
                if (new Random().Next(0, 10) < 3)
                {
                    throw new InvalidOperationException("MinIO Server API Timeout");
                }

                _logger.LogInformation($"Tạo bucket '{bucketName}' thành công!");
                return true;
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Thất bại tạo bucket '{bucketName}' sau 3 lần thử. Lỗi: {ex.Message}");
            return false;
        }
    }
}
