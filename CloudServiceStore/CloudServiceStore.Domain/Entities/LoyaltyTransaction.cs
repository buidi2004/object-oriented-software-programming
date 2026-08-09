using System;

namespace CloudServiceStore.Domain.Entities;

public class LoyaltyTransaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int Points { get; set; } // positive for earned, negative for redeemed
    public string Reason { get; set; } = null!;
    public Guid? RefOrderId { get; set; }
    public DateTime CreatedAt { get; set; }

    public AppUser User { get; set; } = null!;
}
