using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class GameServerInstance : AggregateRoot
{
    public Guid UserId { get; set; }
    public GameType GameType { get; set; }
    public int Port { get; set; }
    public string ContainerId { get; set; } = string.Empty;
    public string ServerName { get; set; } = string.Empty;
    public GameServerStatus Status { get; set; } = GameServerStatus.Creating;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }

    public AppUser? User { get; set; }
}
