using System;
using CloudServiceStore.Domain.Primitives;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class ManagedDatabaseInstance : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public ManagedDatabaseEngine Engine { get; set; }
    public string Version { get; set; } = null!;
    public string AdminUser { get; set; } = null!;
    public string AdminPassword { get; set; } = null!;
    public int Port { get; private set; } // Set by Provisioning Service

    public string IdempotencyKey { get; set; } = "";
    public ManagedDatabaseStatus Status { get; private set; } = ManagedDatabaseStatus.Pending;
    public string FailureReason { get; private set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;

    public void MarkAsProvisioning()
    {
        if (Status != ManagedDatabaseStatus.Pending && Status != ManagedDatabaseStatus.Failed)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Provisioning từ trạng thái {Status}");
        }
        Status = ManagedDatabaseStatus.Provisioning;
        FailureReason = "";
    }

    public void MarkAsRunning(int assignedPort)
    {
        if (Status != ManagedDatabaseStatus.Provisioning)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Running từ trạng thái {Status}");
        }
        Status = ManagedDatabaseStatus.Running;
        Port = assignedPort;
    }

    public void MarkAsFailed(string reason)
    {
        Status = ManagedDatabaseStatus.Failed;
        FailureReason = reason;
    }
}
