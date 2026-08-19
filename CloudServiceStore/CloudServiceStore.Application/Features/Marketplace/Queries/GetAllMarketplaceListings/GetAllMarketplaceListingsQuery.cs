using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Marketplace.Queries.GetAllMarketplaceListings;

public record GetAllMarketplaceListingsQuery() : IRequest<IEnumerable<MarketplaceListing>>;

public class GetAllMarketplaceListingsQueryHandler : IRequestHandler<GetAllMarketplaceListingsQuery, IEnumerable<MarketplaceListing>>
{
    private readonly IRepository<MarketplaceListing> _repo;

    public GetAllMarketplaceListingsQueryHandler(IRepository<MarketplaceListing> repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<MarketplaceListing>> Handle(GetAllMarketplaceListingsQuery request, CancellationToken cancellationToken)
    {
        var all = await _repo.GetAllAsync(cancellationToken);
        return all.Where(x => x.Status == CloudServiceStore.Domain.Enums.MarketplaceListingStatus.Active);
    }
}
