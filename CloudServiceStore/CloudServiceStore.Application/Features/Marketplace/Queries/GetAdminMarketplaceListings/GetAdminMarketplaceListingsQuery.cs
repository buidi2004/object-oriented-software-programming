using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Marketplace.Queries.GetAdminMarketplaceListings;

public record GetAdminMarketplaceListingsQuery() : IRequest<IEnumerable<MarketplaceListing>>;

public class GetAdminMarketplaceListingsQueryHandler : IRequestHandler<GetAdminMarketplaceListingsQuery, IEnumerable<MarketplaceListing>>
{
    private readonly IRepository<MarketplaceListing> _repo;

    public GetAdminMarketplaceListingsQueryHandler(IRepository<MarketplaceListing> repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<MarketplaceListing>> Handle(GetAdminMarketplaceListingsQuery request, CancellationToken cancellationToken)
    {
        return await _repo.GetAllAsync(cancellationToken);
    }
}
