using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class DatabaseInstance : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    private DatabaseEngine _engine;
    public DatabaseEngine Engine
    {
        get => _engine;
        set
        {
            _engine = value;
            Port = value == DatabaseEngine.MySQL ? 3306 : 5432;
            Status = DatabaseInstanceStatus.Creating;
        }
    }
    public string Version { get; set; } = string.Empty;
    public int Port { get; set; }
    public string ConnectionString { get; set; } = string.Empty;
    public DatabaseInstanceStatus Status { get; set; } = DatabaseInstanceStatus.Creating;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }

    public AppUser? User { get; set; }
}
