using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Queries.CheckDomain;

public class CheckDomainQueryHandler : IRequestHandler<CheckDomainQuery, bool>
{
    private readonly IRepository<DomainRecord> _repo;
    public CheckDomainQueryHandler(IRepository<DomainRecord> repo) => _repo = repo;

    public async Task<bool> Handle(CheckDomainQuery request, CancellationToken cancellationToken)
    {
        var domain = await _repo.FirstOrDefaultAsync(d => d.Name == request.DomainName, cancellationToken);
        return domain == null; // True if available, False if already registered
    }
}
