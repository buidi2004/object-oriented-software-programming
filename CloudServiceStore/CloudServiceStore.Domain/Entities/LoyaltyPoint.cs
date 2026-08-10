using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class LoyaltyPoint : AggregateRoot
{
    public Guid UserId { get; set; } // unique
    public int Points { get; set; }

    public AppUser User { get; set; } = null!;
}
