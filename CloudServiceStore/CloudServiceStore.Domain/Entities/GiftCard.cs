using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class GiftCard : AggregateRoot
{
    public string Code { get; set; } = null!; // unique
    public decimal Amount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
}
