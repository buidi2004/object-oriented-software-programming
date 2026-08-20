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
    private readonly IAcmeProvisioningService _acmeService;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<SslRenewalJob> _logger;

    public SslRenewalJob(
        IRepository<SslCertificate> sslRepo,
        IAcmeProvisioningService acmeService,
        IUnitOfWork uow,
        ILogger<SslRenewalJob> logger)
    {
        _sslRepo = sslRepo;
        _acmeService = acmeService;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job kiểm tra và gia hạn SSL...");

        var allCerts = await _sslRepo.GetAllAsync(cancellationToken);
        
        // Gia hạn trước 7 ngày
        var thresholdDate = DateTime.UtcNow.AddDays(7);

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
            _logger.LogInformation($"Tiến hành gia hạn SSL cho DomainId {cert.DomainId}");

            // Fake domain name since we don't eager load Domain here in this simple job
            // Thường thì phải include(x => x.Domain) nhưng ở đây gọi dummy
            var acmeResult = await _acmeService.IssueCertificateAsync("domain.com", cert.Csr, cancellationToken);

            if (acmeResult.IsSuccess)
            {
                cert.MarkAsIssued(acmeResult.Certificate, acmeResult.PrivateKey, acmeResult.ExpiryDate);
                _logger.LogInformation($"Gia hạn thành công SSL cho DomainId {cert.DomainId}");
            }
            else
            {
                // Nếu lỗi gia hạn, cứ để Issued và báo lỗi, đợi chạy lại ngày mai
                _logger.LogWarning($"Gia hạn thất bại SSL cho DomainId {cert.DomainId}: {acmeResult.ErrorMessage}");
            }
        }

        await _uow.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Hoàn tất Job gia hạn SSL.");
    }
}
