using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class CartItem
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public Guid ServicePlanId { get; set; }
    public BillingCycle BillingCycle { get; set; }
    public int Quantity { get; set; }
    
    public Cart Cart { get; set; } = null!;
    public ServicePlan ServicePlan { get; set; } = null!;
}
