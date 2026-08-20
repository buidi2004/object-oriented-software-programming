using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Marketplace.Queries.GetAllMarketplacePurchases;

public record GetAllMarketplacePurchasesQuery() : IRequest<IEnumerable<MarketplacePurchase>>;

public class GetAllMarketplacePurchasesQueryHandler : IRequestHandler<GetAllMarketplacePurchasesQuery, IEnumerable<MarketplacePurchase>>
{
    private readonly IRepository<MarketplacePurchase> _repo;

    public GetAllMarketplacePurchasesQueryHandler(IRepository<MarketplacePurchase> repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<MarketplacePurchase>> Handle(GetAllMarketplacePurchasesQuery request, CancellationToken cancellationToken)
    {
        return await _repo.GetAllAsync(cancellationToken);
    }
}
