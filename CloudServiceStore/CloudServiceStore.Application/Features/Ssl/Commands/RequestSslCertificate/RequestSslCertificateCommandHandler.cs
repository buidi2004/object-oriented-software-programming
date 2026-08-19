using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;

public class RequestSslCertificateCommandHandler : IRequestHandler<RequestSslCertificateCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public RequestSslCertificateCommandHandler(
        IUnitOfWork uow, 
        IRepository<DomainRecord> domainRepo, 
        IRepository<SslCertificate> sslRepo, 
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    { 
        _uow = uow; 
        _domainRepo = domainRepo; 
        _sslRepo = sslRepo; 
        _currentUser = currentUser; 
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(RequestSslCertificateCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var domain = await _domainRepo.GetByIdAsync(request.DomainId, cancellationToken)
            ?? throw new NotFoundException("Tên miền không tồn tại.");
            
        if (domain.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền xin cấp chứng chỉ cho tên miền này.");

        // Idempotency check
        if (!string.IsNullOrEmpty(request.IdempotencyKey))
        {
            var existing = await _sslRepo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
            if (existing != null)
                return existing.Id;
        }

        var cert = new SslCertificate
        {
            Id = Guid.NewGuid(),
            DomainId = request.DomainId,
            Csr = request.Csr,
            IdempotencyKey = request.IdempotencyKey
        };

        await _sslRepo.AddAsync(cert, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var certId = cert.Id;
        var domainName = domain.Name;
        var csr = request.Csr;

        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            await Task.Delay(5000, ct);

            var scopedRepo = serviceProvider.GetRequiredService<IRepository<SslCertificate>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IAcmeProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbCert = await scopedRepo.GetByIdAsync(certId, ct);
            if (dbCert == null) return;

            var acmeResult = await scopedProvService.IssueCertificateAsync(domainName, csr, ct);

            if (acmeResult.IsSuccess)
            {
                dbCert.MarkAsIssued(acmeResult.Certificate, acmeResult.PrivateKey, acmeResult.ExpiryDate);
            }
            else
            {
                dbCert.MarkAsFailed(acmeResult.ErrorMessage);
            }

            await scopedUow.SaveChangesAsync(ct);

            var newStatus = acmeResult.IsSuccess ? "Issued" : "Failed";
            await scopedNotifier.NotifyStatusChangedAsync("SslCertificate", dbCert.Id.ToString(), newStatus);
        });

        return certId;
    }
}
