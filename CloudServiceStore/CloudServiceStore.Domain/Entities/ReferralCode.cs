using System;

namespace CloudServiceStore.Domain.Entities;

public class ReferralCode
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // unique — 1 user = 1 code
    public string Code { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
