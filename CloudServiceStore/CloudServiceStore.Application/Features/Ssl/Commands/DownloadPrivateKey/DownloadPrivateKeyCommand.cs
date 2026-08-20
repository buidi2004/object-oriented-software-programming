using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Ssl.Commands.DownloadPrivateKey;

public record DownloadPrivateKeyCommand(Guid CertificateId, string IpAddress) : IRequest<string>;

public class DownloadPrivateKeyCommandHandler : IRequestHandler<DownloadPrivateKeyCommand, string>
{
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly IRepository<AuditLog> _auditRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public DownloadPrivateKeyCommandHandler(
        IRepository<SslCertificate> sslRepo,
        IRepository<AuditLog> auditRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _sslRepo = sslRepo;
        _auditRepo = auditRepo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<string> Handle(DownloadPrivateKeyCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        var cert = await _sslRepo.GetByIdAsync(request.CertificateId, cancellationToken);
        if (cert == null)
        {
            throw new NotFoundException("Chứng chỉ SSL không tồn tại.");
        }

        bool isAdmin = _currentUser.IsInRole("Admin");
        if (!isAdmin && cert.Domain != null && cert.Domain.UserId != userId)
        {
            throw new UnauthorizedException("Bạn không có quyền tải Private Key của chứng chỉ này.");
        }

        // Record Audit Log in Database
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = AuditAction.Download,
            EntityName = isAdmin ? "SslCertificate_PrivateKey_AdminDownload" : "SslCertificate_PrivateKey",
            EntityId = cert.Id.ToString(),
            IpAddress = string.IsNullOrWhiteSpace(request.IpAddress) ? "127.0.0.1" : request.IpAddress,
            Timestamp = DateTime.UtcNow
        };

        await _auditRepo.AddAsync(auditLog, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(cert.PrivateKey))
        {
            return "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0wG2rS6k8jF2+L7G...DemoKey...\n-----END RSA PRIVATE KEY-----";
        }

        return cert.PrivateKey;
    }
}
