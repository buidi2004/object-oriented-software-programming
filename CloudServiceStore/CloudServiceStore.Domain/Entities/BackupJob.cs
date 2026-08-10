using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class BackupJob : AggregateRoot
{
    public Guid OrderRequestId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public BackupStatus Status { get; set; }
    public int? SizeMb { get; set; }
    public string? BackupUrl { get; set; }
    
    public OrderRequest OrderRequest { get; set; } = null!;
}
