using System;
using CloudServiceStore.Domain.Primitives;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class ObjectStorageBucket : AggregateRoot
{
    public Guid UserId { get; set; }
    public string BucketName { get; set; } = null!;
    public string Region { get; set; } = null!;
    public int CapacityGB { get; set; }

    // Idempotency & State Machine
    public string IdempotencyKey { get; set; } = "";
    public ObjectStorageStatus Status { get; private set; } = ObjectStorageStatus.Pending;
    public string FailureReason { get; private set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser User { get; set; } = null!;

    // State Machine Methods
    public void MarkAsProvisioning()
    {
        if (Status != ObjectStorageStatus.Pending && Status != ObjectStorageStatus.Failed)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Provisioning từ trạng thái {Status}");
        }
        Status = ObjectStorageStatus.Provisioning;
        FailureReason = "";
    }

    public void MarkAsActive()
    {
        if (Status != ObjectStorageStatus.Provisioning)
        {
            throw new InvalidOperationException($"Không thể kích hoạt (Active) bucket từ trạng thái {Status}");
        }
        Status = ObjectStorageStatus.Active;
    }

    public void MarkAsFailed(string reason)
    {
        Status = ObjectStorageStatus.Failed;
        FailureReason = reason;
    }
}
