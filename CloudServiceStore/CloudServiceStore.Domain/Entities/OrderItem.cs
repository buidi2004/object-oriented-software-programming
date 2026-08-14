using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class OrderItem : Entity
{
    public Guid OrderRequestId { get; private set; }
    public Guid ServicePlanId { get; private set; }
    public BillingCycle BillingCycle { get; private set; }
    public int Quantity { get; private set; }
    public decimal Price { get; private set; }

    public OrderRequest OrderRequest { get; private set; } = null!;
    public ServicePlan ServicePlan { get; private set; } = null!;

    private OrderItem() { }

    public OrderItem(Guid servicePlanId, BillingCycle billingCycle, int quantity, decimal price)
    {
        Id = Guid.NewGuid();
        ServicePlanId = servicePlanId;
        BillingCycle = billingCycle;
        Quantity = quantity;
        Price = price;
    }
}
