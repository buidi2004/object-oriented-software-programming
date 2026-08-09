using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class PlanPrice
{
    public Guid Id { get; set; }
    public Guid ServicePlanId { get; set; }
    public BillingCycle BillingCycle { get; set; }
    public decimal Price { get; set; }
    public DateTime EffectiveFrom { get; set; }
    
    public ServicePlan ServicePlan { get; set; } = null!;
}
