using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Jobs;

public class SslRenewalJob
{
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IAcmeProvisioningService _acmeService;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<SslRenewalJob> _logger;

    public SslRenewalJob(
        IRepository<SslCertificate> sslRepo,
        IRepository<DomainRecord> domainRepo,
        IAcmeProvisioningService acmeService,
        IUnitOfWork uow,
        ILogger<SslRenewalJob> logger)
    {
        _sslRepo = sslRepo;
        _domainRepo = domainRepo;
        _acmeService = acmeService;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job kiểm tra và gia hạn SSL...");

        var allCerts = await _sslRepo.GetAllAsync(cancellationToken);
        
        // Gia hạn trước 30 ngày theo tiêu chuẩn Let's Encrypt / ACME
        var thresholdDate = DateTime.UtcNow.AddDays(30);

        var expiringCerts = allCerts.Where(x => 
            x.Status == SslCertificateStatus.Issued && 
            x.ExpiryDate.HasValue && 
            x.ExpiryDate.Value <= thresholdDate).ToList();

        if (!expiringCerts.Any())
        {
            _logger.LogInformation("Không có SSL nào cần gia hạn hôm nay.");
            return;
        }

        foreach (var cert in expiringCerts)
        {
            _logger.LogInformation("Tiến hành gia hạn SSL cho DomainId {DomainId}", cert.DomainId);

            var domain = await _domainRepo.GetByIdAsync(cert.DomainId, cancellationToken);
            var domainName = domain?.Name ?? "example.com";

            var acmeResult = await _acmeService.IssueCertificateAsync(domainName, cert.Csr, cancellationToken);

            if (acmeResult.IsSuccess)
            {
                cert.MarkAsIssued(acmeResult.Certificate, acmeResult.PrivateKey, acmeResult.ExpiryDate);
                _logger.LogInformation("Gia hạn thành công SSL cho {DomainName} (DomainId {DomainId})", domainName, cert.DomainId);
            }
            else
            {
                // Nếu lỗi gia hạn, cứ để Issued và báo lỗi, đợi chạy lại ở lần chạy tiếp theo
                _logger.LogWarning("Gia hạn thất bại SSL cho {DomainName}: {Error}", domainName, acmeResult.ErrorMessage);
            }
        }

        await _uow.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Hoàn tất Job gia hạn SSL.");
    }
}
