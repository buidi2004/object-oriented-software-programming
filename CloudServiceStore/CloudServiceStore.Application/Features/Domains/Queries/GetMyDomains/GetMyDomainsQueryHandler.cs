using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Queries.GetMyDomains;

public class GetMyDomainsQueryHandler : IRequestHandler<GetMyDomainsQuery, IEnumerable<DomainRecord>>
{
    private readonly IRepository<DomainRecord> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyDomainsQueryHandler(IRepository<DomainRecord> repo, ICurrentUserService currentUser)
    { _repo = repo; _currentUser = currentUser; }

    public async Task<IEnumerable<DomainRecord>> Handle(GetMyDomainsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        return await _repo.WhereAsync(d => d.UserId == userId, cancellationToken);
    }
}
