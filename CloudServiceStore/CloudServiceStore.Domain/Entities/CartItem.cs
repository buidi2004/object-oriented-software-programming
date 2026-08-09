using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class CartItem : Entity
{
    public Guid CartId { get; private set; }
    public Guid ServicePlanId { get; private set; }
    public BillingCycle BillingCycle { get; private set; }
    public int Quantity { get; private set; }

    public Cart Cart { get; private set; } = null!;
    public ServicePlan ServicePlan { get; private set; } = null!;

    private CartItem() { } // For EF Core

    internal CartItem(Guid servicePlanId, BillingCycle billingCycle, int quantity)
    {
        ServicePlanId = servicePlanId;
        BillingCycle = billingCycle;
        Quantity = quantity;
    }

    internal void UpdateQuantity(int quantity)
    {
        if (quantity <= 0) throw new ArgumentException("Quantity must be greater than 0");
        Quantity = quantity;
    }
}
