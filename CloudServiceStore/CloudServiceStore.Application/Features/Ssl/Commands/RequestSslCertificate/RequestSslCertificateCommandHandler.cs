using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;

public class RequestSslCertificateCommandHandler : IRequestHandler<RequestSslCertificateCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IAcmeProvisioningService _acmeService;

    public RequestSslCertificateCommandHandler(
        IUnitOfWork uow, 
        IRepository<DomainRecord> domainRepo, 
        IRepository<SslCertificate> sslRepo, 
        ICurrentUserService currentUser,
        IAcmeProvisioningService acmeService)
    { 
        _uow = uow; 
        _domainRepo = domainRepo; 
        _sslRepo = sslRepo; 
        _currentUser = currentUser; 
        _acmeService = acmeService;
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

        // Gọi ACME service
        var acmeResult = await _acmeService.IssueCertificateAsync(domain.Name, request.Csr, cancellationToken);

        if (acmeResult.IsSuccess)
        {
            cert.MarkAsIssued(acmeResult.Certificate, acmeResult.PrivateKey, acmeResult.ExpiryDate);
        }
        else
        {
            cert.MarkAsFailed(acmeResult.ErrorMessage);
        }

        await _uow.SaveChangesAsync(cancellationToken);

        return cert.Id;
    }
}
