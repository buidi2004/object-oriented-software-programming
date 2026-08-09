using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class MigrationRequest : AggregateRoot
{
    public Guid UserId { get; set; }
    public Guid OrderRequestId { get; set; }
    public string FromProvider { get; set; } = string.Empty;
    public MigrationStatus Status { get; set; } = MigrationStatus.Pending;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
