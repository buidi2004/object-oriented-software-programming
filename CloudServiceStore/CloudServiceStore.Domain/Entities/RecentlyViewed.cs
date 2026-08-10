using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class RecentlyViewed : AggregateRoot
{
    public Guid UserId { get; internal set; }
    public Guid ServicePlanId { get; internal set; }
    public DateTime ViewedAt { get; internal set; }

    public AppUser User { get; internal set; } = null!;
    public ServicePlan ServicePlan { get; internal set; } = null!;

    internal RecentlyViewed() { }

    public RecentlyViewed(Guid userId, Guid servicePlanId)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        ServicePlanId = servicePlanId;
        ViewedAt = DateTime.UtcNow;
    }

    public void UpdateViewTime()
    {
        ViewedAt = DateTime.UtcNow;
    }
}
