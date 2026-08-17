using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class DatabaseInstance : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public DatabaseEngine Engine { get; set; }
    public string Version { get; set; } = string.Empty;
    public int Port { get; set; }
    public string ConnectionString { get; set; } = string.Empty;
    public DatabaseInstanceStatus Status { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }

    public AppUser? User { get; set; }
}
