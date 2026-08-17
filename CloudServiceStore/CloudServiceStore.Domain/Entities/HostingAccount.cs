using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class HostingAccount : AggregateRoot
{
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public string ContainerId { get; set; } = string.Empty;
    public string ControlPanelUrl { get; set; } = string.Empty;
    public int DiskUsedGb { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }

    public AppUser? User { get; set; }
    public HostingPlan? Plan { get; set; }
}
