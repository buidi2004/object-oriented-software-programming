using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class SecuritySubscription : AggregateRoot
{
    public Guid UserId { get; set; }
    public string TargetResourceId { get; set; } = string.Empty;
    public SecurityAddonType AddonType { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime SubscribedAt { get; set; }
}
