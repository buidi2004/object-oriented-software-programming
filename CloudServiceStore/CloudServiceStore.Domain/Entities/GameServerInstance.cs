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
    public GameServerStatus Status { get; set; } = GameServerStatus.Pending;
    public string IdempotencyKey { get; set; } = "";
    public string FailureReason { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }

    public AppUser? User { get; set; }

    public void MarkAsProvisioning()
    {
        if (Status != GameServerStatus.Pending && Status != GameServerStatus.Failed)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Provisioning từ trạng thái {Status}");
        }
        Status = GameServerStatus.Provisioning;
        FailureReason = "";
    }

    public void MarkAsRunning(int assignedPort)
    {
        if (Status != GameServerStatus.Provisioning)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Running từ trạng thái {Status}");
        }
        Status = GameServerStatus.Running;
        Port = assignedPort;
    }

    public void MarkAsFailed(string reason)
    {
        Status = GameServerStatus.Failed;
        FailureReason = reason;
    }
}
