using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificateById;

public class GetSslCertificateByIdQueryHandler : IRequestHandler<GetSslCertificateByIdQuery, SslCertificate>
{
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly ICurrentUserService _currentUser;

    public GetSslCertificateByIdQueryHandler(IRepository<SslCertificate> sslRepo, IRepository<DomainRecord> domainRepo, ICurrentUserService currentUser)
    { _sslRepo = sslRepo; _domainRepo = domainRepo; _currentUser = currentUser; }

    public async Task<SslCertificate> Handle(GetSslCertificateByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var ssl = await _sslRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Chứng chỉ không tồn tại.");
            
        var domain = await _domainRepo.GetByIdAsync(ssl.DomainId, cancellationToken);
        if (domain == null || domain.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền truy cập chứng chỉ này.");

        return ssl;
    }
}
