using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class Coupon : AggregateRoot
{
    public string Code { get; internal set; } = null!;
    public decimal DiscountPercent { get; internal set; }
    public int MaxUsage { get; internal set; }
    public int UsedCount { get; internal set; }
    public DateTime ExpiryDate { get; internal set; }
    public bool IsActive { get; internal set; }

    internal Coupon() { }

    public Coupon(string code, decimal discountPercent, int maxUsage, DateTime expiryDate)
    {
        Id = Guid.NewGuid();
        Code = code;
        DiscountPercent = discountPercent;
        MaxUsage = maxUsage;
        ExpiryDate = expiryDate;
        IsActive = true;
        UsedCount = 0;
    }

    public void Use()
    {
        if (!IsActive) throw new InvalidOperationException("Mã giảm giá đã bị vô hiệu hóa.");
        if (ExpiryDate < DateTime.UtcNow) throw new InvalidOperationException("Mã giảm giá đã hết hạn.");
        if (UsedCount >= MaxUsage) throw new InvalidOperationException("Mã giảm giá đã vượt quá số lần sử dụng.");

        UsedCount++;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
