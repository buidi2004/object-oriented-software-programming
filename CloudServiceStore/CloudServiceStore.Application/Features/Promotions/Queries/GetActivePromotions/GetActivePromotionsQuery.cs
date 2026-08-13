using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Promotions.Queries.GetPromotions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Queries.GetActivePromotions;

public record GetActivePromotionsQuery() : IRequest<IReadOnlyList<PromotionDto>>;

public class GetActivePromotionsQueryHandler : IRequestHandler<GetActivePromotionsQuery, IReadOnlyList<PromotionDto>>
{
    private readonly IRepository<Promotion> _promoRepo;

    public GetActivePromotionsQueryHandler(IRepository<Promotion> promoRepo)
    {
        _promoRepo = promoRepo;
    }

    public async Task<IReadOnlyList<PromotionDto>> Handle(GetActivePromotionsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var promotions = await _promoRepo.WhereAsync(p => p.StartDate <= now && p.EndDate >= now, cancellationToken);
        
        return promotions.Select(p => new PromotionDto(
            p.Id, 
            p.ServicePlanId, 
            p.DiscountPercent, 
            p.StartDate, 
            p.EndDate)).ToList();
    }
}
