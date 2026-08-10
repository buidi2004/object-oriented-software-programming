using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ReferralCode : AggregateRoot
{
    public Guid UserId { get; set; } // unique — 1 user = 1 code
    public string Code { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
