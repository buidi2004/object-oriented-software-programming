using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Queries.GetDnsRecords;

public class GetDnsRecordsQueryHandler : IRequestHandler<GetDnsRecordsQuery, IEnumerable<DnsRecord>>
{
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IRepository<DnsRecord> _dnsRepo;
    private readonly ICurrentUserService _currentUser;

    public GetDnsRecordsQueryHandler(IRepository<DomainRecord> domainRepo, IRepository<DnsRecord> dnsRepo, ICurrentUserService currentUser)
    { _domainRepo = domainRepo; _dnsRepo = dnsRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<DnsRecord>> Handle(GetDnsRecordsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var domain = await _domainRepo.GetByIdAsync(request.DomainId, cancellationToken)
            ?? throw new NotFoundException("Tên miền không tồn tại.");
            
        if (domain.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền xem bản ghi DNS của tên miền này.");

        return await _dnsRepo.WhereAsync(d => d.DomainId == request.DomainId, cancellationToken);
    }
}
