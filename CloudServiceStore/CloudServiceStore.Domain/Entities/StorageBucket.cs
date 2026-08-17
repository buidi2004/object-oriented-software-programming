using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class StorageBucket : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public BucketVisibility Visibility { get; set; }
    public long SizeBytes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }
}
