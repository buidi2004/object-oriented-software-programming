using System;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class VpsInstance : AggregateRoot
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }

    public string ContainerId { get; set; } = string.Empty;
    public string ContainerName { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;

    public int CpuCores { get; set; }
    public int RamMb { get; set; }
    public int? DiskGb { get; set; }

    public VpsInstanceStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime LastActiveAt { get; set; }

    public OrderRequest? Order { get; set; }
    public AppUser? User { get; set; }
}
