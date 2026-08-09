using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class OrderRequest
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // Non-nullable, no guest checkout
    public Guid ServicePlanId { get; set; }
    public BillingCycle BillingCycle { get; set; }
    public OrderStatus Status { get; set; }
    public Guid? CouponId { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TotalAmount { get; set; }
    public bool AutoRenew { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    
    public AppUser User { get; set; } = null!;
    public ServicePlan ServicePlan { get; set; } = null!;
    public Payment? Payment { get; set; }
    public Coupon? Coupon { get; set; }
}
