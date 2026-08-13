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

namespace CloudServiceStore.Application.Features.Categories.Queries.GetCategoryPlansBySlug;

public record GetCategoryPlansBySlugQuery(string Slug, string Currency = "VND") : IRequest<CategoryPlansDto>;

public class GetCategoryPlansBySlugQueryHandler : IRequestHandler<GetCategoryPlansBySlugQuery, CategoryPlansDto>
{
    private static readonly Dictionary<string, string> SlugAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["hosting"] = "web-hosting",
        ["domain"] = "ten-mien",
        ["vps"] = "cloud-vps",
        ["email"] = "email-server",
        ["ssl"] = "ssl-certificate",
        ["dedicated"] = "dedicated-server",
    };

    private readonly IRepository<ServiceCategory> _categoryRepo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<PlanPrice> _planPriceRepo;
    private readonly IRepository<ExchangeRate> _exchangeRateRepo;

    public GetCategoryPlansBySlugQueryHandler(
        IRepository<ServiceCategory> categoryRepo,
        IRepository<ServicePlan> planRepo,
        IRepository<PlanPrice> planPriceRepo,
        IRepository<ExchangeRate> exchangeRateRepo)
    {
        _categoryRepo = categoryRepo;
        _planRepo = planRepo;
        _planPriceRepo = planPriceRepo;
        _exchangeRateRepo = exchangeRateRepo;
    }

    public async Task<CategoryPlansDto> Handle(GetCategoryPlansBySlugQuery request, CancellationToken cancellationToken)
    {
        var slug = ResolveSlug(request.Slug);
        var currency = (request.Currency ?? "VND").ToUpperInvariant();

        var category = await _categoryRepo.FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);
        if (category == null)
            throw new NotFoundException($"Danh mục '{request.Slug}' không tồn tại.");

        var plans = (await _planRepo.WhereAsync(
                p => p.CategoryId == category.Id && p.IsActive,
                cancellationToken))
            .OrderBy(p => p.Name)
            .ToList();
        if (plans.Count == 0)
        {
            return new CategoryPlansDto
            {
                CategoryId = category.Id,
                CategoryName = category.Name,
                CategorySlug = category.Slug,
                Plans = new List<CategoryPlanCardDto>()
            };
        }

        var planIds = plans.Select(p => p.Id).ToList();
        var allPrices = await _planPriceRepo.WhereAsync(
            p => planIds.Contains(p.ServicePlanId) && p.Currency == "VND",
            cancellationToken);

        ExchangeRate? rate = null;
        if (currency != "VND")
        {
            rate = await _exchangeRateRepo.FirstOrDefaultAsync(
                r => r.FromCurrency == "VND" && r.ToCurrency == currency,
                cancellationToken);
        }

        decimal Convert(decimal vnd) => rate != null ? Math.Round(vnd * rate.Rate, 2) : vnd;

        var priceLookup = allPrices
            .GroupBy(p => (p.ServicePlanId, p.BillingCycle))
            .ToDictionary(
                g => g.Key,
                g => Convert(g.OrderByDescending(x => x.EffectiveFrom).First().Price));

        var cards = plans.Select(plan =>
        {
            priceLookup.TryGetValue((plan.Id, BillingCycle.Monthly), out var monthly);
            priceLookup.TryGetValue((plan.Id, BillingCycle.Yearly), out var yearly);

            return new CategoryPlanCardDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Cpu = plan.Cpu,
                Ram = plan.Ram,
                Ssd = plan.Ssd,
                Bandwidth = plan.Bandwidth,
                MonthlyPrice = monthly,
                YearlyPrice = yearly,
                Currency = currency
            };
        }).ToList();

        return new CategoryPlansDto
        {
            CategoryId = category.Id,
            CategoryName = category.Name,
            CategorySlug = category.Slug,
            Plans = cards
        };
    }

    private static string ResolveSlug(string slug)
    {
        if (SlugAliases.TryGetValue(slug, out var canonical))
            return canonical;
        return slug;
    }
}
