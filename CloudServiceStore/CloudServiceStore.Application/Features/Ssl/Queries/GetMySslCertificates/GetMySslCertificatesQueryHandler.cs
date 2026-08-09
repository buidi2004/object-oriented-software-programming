using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Ssl.Queries.GetMySslCertificates;

public class GetMySslCertificatesQueryHandler : IRequestHandler<GetMySslCertificatesQuery, IEnumerable<SslCertificate>>
{
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMySslCertificatesQueryHandler(IRepository<SslCertificate> sslRepo, ICurrentUserService currentUser)
    { _sslRepo = sslRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<SslCertificate>> Handle(GetMySslCertificatesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        // Cần include DomainRecord để kiểm tra quyền sở hữu, 
        // giả lập bằng việc query những chứng chỉ có Domain thuộc UserId
        return await _sslRepo.WhereAsync(s => s.Domain.UserId == userId, cancellationToken);
    }
}
