using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.DTOs;

public class ServicePlanPriceDto
{
    public Guid ServicePlanId { get; set; }
    public string ServicePlanName { get; set; } = null!;
    public BillingCycle BillingCycle { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "VND";
}
