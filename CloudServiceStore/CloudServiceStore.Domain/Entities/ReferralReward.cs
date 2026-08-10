using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ReferralReward : AggregateRoot
{
    public Guid ReferrerUserId { get; set; }  // người giới thiệu
    public Guid ReferredUserId { get; set; }  // người được giới thiệu
    public decimal RewardAmount { get; set; } // số tiền thưởng nạp vào ví
    public string Status { get; set; } = "Pending"; // Pending | Credited

    public AppUser Referrer { get; set; } = null!;
    public AppUser Referred { get; set; } = null!;
}
