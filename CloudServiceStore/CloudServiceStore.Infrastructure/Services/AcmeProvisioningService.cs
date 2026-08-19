using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;

namespace CloudServiceStore.Infrastructure.Services;

public class AcmeProvisioningService : IAcmeProvisioningService
{
    private readonly ILogger<AcmeProvisioningService> _logger;
    private readonly AsyncRetryPolicy _retryPolicy;

    public AcmeProvisioningService(ILogger<AcmeProvisioningService> logger)
    {
        _logger = logger;

        // Cấu hình Polly Retry: Thử lại 3 lần, cấp số nhân thời gian chờ (2s, 4s, 8s)
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogWarning($"Lỗi khi cấp phát SSL (Lần {retryCount}). Thử lại sau {timeSpan.TotalSeconds} giây. Lỗi: {exception.Message}");
                });
    }

    public async Task<SslResult> IssueCertificateAsync(string domain, string csr, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                _logger.LogInformation($"Bắt đầu gọi Let's Encrypt cho tên miền {domain}...");
                
                // Giả lập độ trễ mạng hoặc tiến trình ACME
                await Task.Delay(1500, cancellationToken);

                // Giả lập tỷ lệ lỗi ngẫu nhiên để test Polly
                if (new Random().Next(0, 10) < 3) 
                {
                    throw new InvalidOperationException("ACME Server Timeout");
                }

                _logger.LogInformation($"Cấp phát SSL thành công cho tên miền {domain}");

                var fakeCert = $"-----BEGIN CERTIFICATE-----\nMIIDdzCCAl+gAwIBAgIEX...({domain})...\n-----END CERTIFICATE-----";
                var fakeKey = $"-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...({domain})...\n-----END RSA PRIVATE KEY-----";

                return new SslResult(
                    IsSuccess: true,
                    Certificate: fakeCert,
                    PrivateKey: fakeKey,
                    ExpiryDate: DateTime.UtcNow.AddDays(90),
                    ErrorMessage: ""
                );
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Thất bại hoàn toàn sau 3 lần thử cấp SSL cho {domain}. Lỗi: {ex.Message}");
            return new SslResult(false, "", "", DateTime.MinValue, ex.Message);
        }
    }
}
