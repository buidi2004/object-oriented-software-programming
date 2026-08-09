using System;

namespace CloudServiceStore.Domain.Entities;

public class LoyaltyPoint
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // unique
    public int Points { get; set; }

    public AppUser User { get; set; } = null!;
}
