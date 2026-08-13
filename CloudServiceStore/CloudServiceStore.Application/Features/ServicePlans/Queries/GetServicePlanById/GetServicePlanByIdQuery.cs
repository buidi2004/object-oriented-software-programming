using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanById;

public record GetServicePlanByIdQuery(Guid Id, string Currency = "VND") : IRequest<ServicePlanDetailDto>;

public class GetServicePlanByIdQueryHandler : IRequestHandler<GetServicePlanByIdQuery, ServicePlanDetailDto>
{
    private readonly IRepository<ServicePlan> _servicePlanRepo;
    private readonly IRepository<PlanPrice> _planPriceRepo;
    private readonly IRepository<Promotion> _promotionRepo;
    private readonly IRepository<ExchangeRate> _exchangeRateRepo;

    public GetServicePlanByIdQueryHandler(
        IRepository<ServicePlan> servicePlanRepo,
        IRepository<PlanPrice> planPriceRepo,
        IRepository<Promotion> promotionRepo,
        IRepository<ExchangeRate> exchangeRateRepo)
    {
        _servicePlanRepo = servicePlanRepo;
        _planPriceRepo = planPriceRepo;
        _promotionRepo = promotionRepo;
        _exchangeRateRepo = exchangeRateRepo;
    }

    public async Task<ServicePlanDetailDto> Handle(GetServicePlanByIdQuery request, CancellationToken cancellationToken)
    {
        var plan = await _servicePlanRepo.FirstOrDefaultAsync(
            p => p.Id == request.Id && p.IsActive,
            cancellationToken,
            p => p.Category);

        if (plan == null)
            throw new NotFoundException("Gói dịch vụ không tồn tại hoặc đã bị khoá.");

        var currency = (request.Currency ?? "VND").ToUpperInvariant();
        var vndPrices = (await _planPriceRepo.WhereAsync(
            p => p.ServicePlanId == request.Id && p.Currency == "VND",
            cancellationToken)).ToList();

        ExchangeRate? rate = null;
        if (currency != "VND")
        {
            rate = await _exchangeRateRepo.FirstOrDefaultAsync(
                r => r.FromCurrency == "VND" && r.ToCurrency == currency,
                cancellationToken);
        }

        var prices = vndPrices
            .GroupBy(p => p.BillingCycle)
            .Select(g => g.OrderByDescending(p => p.EffectiveFrom).First())
            .Select(p => new ServicePlanPriceOptionDto
            {
                BillingCycle = p.BillingCycle,
                Price = rate != null ? Math.Round(p.Price * rate.Rate, 2) : p.Price,
                Currency = currency
            })
            .OrderBy(p => p.BillingCycle)
            .ToList();

        var now = DateTime.UtcNow;
        var promotions = (await _promotionRepo.WhereAsync(
            promo => (promo.ServicePlanId == request.Id || promo.ServicePlanId == null)
                     && promo.StartDate <= now
                     && promo.EndDate >= now,
            cancellationToken))
            .Select(p => new ServicePlanPromotionBriefDto
            {
                Id = p.Id,
                DiscountPercent = p.DiscountPercent
            })
            .ToList();

        return new ServicePlanDetailDto
        {
            Id = plan.Id,
            Name = plan.Name,
            CategoryId = plan.CategoryId,
            CategoryName = plan.Category?.Name ?? string.Empty,
            CategorySlug = plan.Category?.Slug ?? string.Empty,
            Cpu = plan.Cpu,
            Ram = plan.Ram,
            Ssd = plan.Ssd,
            Bandwidth = plan.Bandwidth,
            IsActive = plan.IsActive,
            Prices = prices,
            ActivePromotions = promotions
        };
    }
}
