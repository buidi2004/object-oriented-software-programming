using System;

namespace CloudServiceStore.Domain.Entities;

public class Coupon
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public decimal DiscountPercent { get; set; }
    public int MaxUsage { get; set; }
    public int UsedCount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; }
}
