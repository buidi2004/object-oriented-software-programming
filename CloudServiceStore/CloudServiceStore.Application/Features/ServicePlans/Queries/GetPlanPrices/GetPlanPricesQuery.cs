using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetPlanPrices;

public record PlanPriceDto(Guid Id, int BillingCycle, decimal Price, string Currency, DateTime EffectiveFrom);

public record GetPlanPricesQuery(Guid ServicePlanId) : IRequest<List<PlanPriceDto>>;

public class GetPlanPricesQueryHandler : IRequestHandler<GetPlanPricesQuery, List<PlanPriceDto>>
{
    private readonly IRepository<PlanPrice> _repository;

    public GetPlanPricesQueryHandler(IRepository<PlanPrice> repository)
    {
        _repository = repository;
    }

    public async Task<List<PlanPriceDto>> Handle(GetPlanPricesQuery request, CancellationToken cancellationToken)
    {
        var prices = await _repository.WhereAsync(p => p.ServicePlanId == request.ServicePlanId, cancellationToken);
        return prices.OrderBy(p => p.BillingCycle).ThenByDescending(p => p.EffectiveFrom)
            .Select(p => new PlanPriceDto(p.Id, (int)p.BillingCycle, p.Price, p.Currency, p.EffectiveFrom))
            .ToList();
    }
}
