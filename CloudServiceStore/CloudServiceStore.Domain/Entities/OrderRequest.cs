using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class OrderRequest : AggregateRoot
{
    public Guid UserId { get; internal set; }
    public Guid ServicePlanId { get; internal set; }
    public BillingCycle BillingCycle { get; internal set; }
    public OrderStatus Status { get; set; } // Left internal or handled via method
    public Guid? CouponId { get; internal set; }
    public decimal DiscountAmount { get; internal set; }
    public decimal SubTotal { get; internal set; }
    public decimal TotalAmount { get; internal set; }
    public bool AutoRenew { get; internal set; }
    public DateTime CreatedAt { get; internal set; }

    public AppUser User { get; internal set; } = null!;
    public ServicePlan ServicePlan { get; internal set; } = null!;
    public Payment? Payment { get; internal set; }
    public Coupon? Coupon { get; internal set; }
    public Invoice? Invoice { get; internal set; }

    internal OrderRequest() { } // ORM only

    public OrderRequest(Guid userId, Guid servicePlanId, BillingCycle billingCycle, Guid? couponId, decimal discountAmount, decimal subTotal, bool autoRenew = false)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        ServicePlanId = servicePlanId;
        BillingCycle = billingCycle;
        Status = OrderStatus.Pending;
        CouponId = couponId;
        DiscountAmount = discountAmount;
        SubTotal = subTotal;
        TotalAmount = subTotal - discountAmount;
        AutoRenew = autoRenew;
        CreatedAt = DateTime.UtcNow;
    }

    public void Pay()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Chỉ có thể thanh toán đơn hàng đang chờ xử lý.");

        Status = OrderStatus.Paid;
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Paid)
            throw new InvalidOperationException("Không thể hủy đơn hàng đã thanh toán.");

        Status = OrderStatus.Cancelled;
    }

    public void MarkRefunded()
    {
        if (Status != OrderStatus.Paid)
            throw new InvalidOperationException("Chỉ đơn hàng đã thanh toán mới được hoàn tiền.");

        Status = OrderStatus.Refunded;
    }

    public void ToggleAutoRenew(bool enable)
    {
        AutoRenew = enable;
    }

    public void ApplyCoupon(Coupon coupon)
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Chỉ có thể áp dụng mã giảm giá cho đơn hàng chưa thanh toán.");
            
        if (CouponId.HasValue)
            throw new InvalidOperationException("Đơn hàng đã được áp dụng mã giảm giá.");

        coupon.Use();
        CouponId = coupon.Id;
        DiscountAmount = SubTotal * (coupon.DiscountPercent / 100);
        TotalAmount = SubTotal - DiscountAmount;
    }
}
