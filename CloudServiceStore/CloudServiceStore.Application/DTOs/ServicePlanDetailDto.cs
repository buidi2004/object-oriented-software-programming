using System;
using System.Collections.Generic;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.DTOs;

public class ServicePlanPriceOptionDto
{
    public BillingCycle BillingCycle { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "VND";
}

public class ServicePlanPromotionBriefDto
{
    public Guid Id { get; set; }
    public decimal DiscountPercent { get; set; }
}

public class ServicePlanDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string? Cpu { get; set; }
    public string? Ram { get; set; }
    public string? Ssd { get; set; }
    public string? Bandwidth { get; set; }
    public bool IsActive { get; set; }
    public List<ServicePlanPriceOptionDto> Prices { get; set; } = new();
    public List<ServicePlanPromotionBriefDto> ActivePromotions { get; set; } = new();
}

public class CategoryPlanCardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Cpu { get; set; }
    public string? Ram { get; set; }
    public string? Ssd { get; set; }
    public string? Bandwidth { get; set; }
    public decimal? MonthlyPrice { get; set; }
    public decimal? YearlyPrice { get; set; }
    public string Currency { get; set; } = "VND";
}

public class CategoryPlansDto
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public List<CategoryPlanCardDto> Plans { get; set; } = new();
}
