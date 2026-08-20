using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Security.Queries.GetAllSecuritySubscriptions;

public record GetAllSecuritySubscriptionsQuery() : IRequest<IEnumerable<SecuritySubscription>>;

public class GetAllSecuritySubscriptionsQueryHandler : IRequestHandler<GetAllSecuritySubscriptionsQuery, IEnumerable<SecuritySubscription>>
{
    private readonly IRepository<SecuritySubscription> _repo;

    public GetAllSecuritySubscriptionsQueryHandler(IRepository<SecuritySubscription> repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<SecuritySubscription>> Handle(GetAllSecuritySubscriptionsQuery request, CancellationToken cancellationToken)
    {
        return await _repo.GetAllAsync(cancellationToken);
    }
}
