using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlansWithCurrency;

public class GetServicePlansWithCurrencyQueryHandler
    : IRequestHandler<GetServicePlansWithCurrencyQuery, IReadOnlyList<ServicePlanPriceDto>>
{
    private readonly IRepository<PlanPrice> _planPriceRepo;
    private readonly IRepository<ExchangeRate> _exchangeRateRepo;
    private readonly IRepository<ServicePlan> _servicePlanRepo;

    public GetServicePlansWithCurrencyQueryHandler(
        IRepository<PlanPrice> planPriceRepo,
        IRepository<ExchangeRate> exchangeRateRepo,
        IRepository<ServicePlan> servicePlanRepo)
    {
        _planPriceRepo = planPriceRepo;
        _exchangeRateRepo = exchangeRateRepo;
        _servicePlanRepo = servicePlanRepo;
    }

    public async Task<IReadOnlyList<ServicePlanPriceDto>> Handle(
        GetServicePlansWithCurrencyQuery request,
        CancellationToken cancellationToken)
    {
        var currency = (request.Currency ?? "VND").ToUpperInvariant();

        // Get all VND prices (the source of truth)
        var allPrices = await _planPriceRepo.GetAllAsync(cancellationToken);
        
        // Since generic repo GetAllAsync might not Include, let's fetch ServicePlans manually
        var planIds = allPrices.Select(p => p.ServicePlanId).Distinct().ToList();
        var plans = await _servicePlanRepo.WhereAsync(p => planIds.Contains(p.Id), cancellationToken);
        var planDict = plans.ToDictionary(p => p.Id, p => p.Name);

        var vndPrices = allPrices.Where(p => p.Currency == "VND").ToList();

        ExchangeRate? rate = null;
        if (currency != "VND")
        {
            rate = await _exchangeRateRepo.FirstOrDefaultAsync(
                r => r.FromCurrency == "VND" && r.ToCurrency == currency,
                cancellationToken);
        }

        var result = vndPrices.Select(p =>
        {
            var convertedPrice = (rate != null) ? Math.Round(p.Price * rate.Rate, 2) : p.Price;

            return new ServicePlanPriceDto
            {
                ServicePlanId = p.ServicePlanId,
                ServicePlanName = planDict.GetValueOrDefault(p.ServicePlanId, string.Empty),
                BillingCycle = p.BillingCycle,
                Price = convertedPrice,
                Currency = currency
            };
        }).ToList();

        return result;
    }
}
