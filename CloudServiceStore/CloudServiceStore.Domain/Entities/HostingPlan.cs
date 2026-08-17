using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class HostingPlan : AggregateRoot
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DiskGb { get; set; }
    public int BandwidthGb { get; set; }
    public int MaxUsers { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
}
