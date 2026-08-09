using System;

namespace CloudServiceStore.Domain.Entities;

public class WishlistItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ServicePlanId { get; set; }
    public DateTime AddedAt { get; set; }

    public AppUser User { get; set; } = null!;
    public ServicePlan ServicePlan { get; set; } = null!;
}
