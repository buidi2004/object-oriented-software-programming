using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class RecentlyViewedItem : AggregateRoot
{
    public Guid UserId { get; set; }
    public Guid ServicePlanId { get; set; }
    public DateTime ViewedAt { get; set; }

    public AppUser User { get; set; } = null!;
    public ServicePlan ServicePlan { get; set; } = null!;
}
