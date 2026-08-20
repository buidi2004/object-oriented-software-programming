using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public record SslResult(bool IsSuccess, string Certificate, string PrivateKey, DateTime ExpiryDate, string ErrorMessage);

public interface IAcmeProvisioningService
{
    Task<SslResult> IssueCertificateAsync(string domain, string csr, CancellationToken cancellationToken = default);
}
