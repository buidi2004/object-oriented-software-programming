using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Queries.GetPromotions;

public class GetPromotionsQueryHandler : IRequestHandler<GetPromotionsQuery, IReadOnlyList<PromotionDto>>
{
    private readonly IRepository<Promotion> _promoRepo;

    public GetPromotionsQueryHandler(IRepository<Promotion> promoRepo)
    {
        _promoRepo = promoRepo;
    }

    public async Task<IReadOnlyList<PromotionDto>> Handle(GetPromotionsQuery request, CancellationToken ct)
    {
        var promos = await _promoRepo.GetAllAsync(ct);

        return promos.Select(p => new PromotionDto(
            p.Id, p.ServicePlanId, p.DiscountPercent, p.StartDate, p.EndDate
        )).ToList().AsReadOnly();
    }
}
