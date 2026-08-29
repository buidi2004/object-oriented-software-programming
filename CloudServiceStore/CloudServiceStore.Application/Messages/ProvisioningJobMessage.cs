using System;

namespace CloudServiceStore.Application.Messages;

/// <summary>
/// Message đại diện cho một job provisioning tài nguyên hạ tầng (VPS, Database, SSL...).
/// Được publish lên queue "provisioning.tasks" khi khách đặt mua thành công.
/// </summary>
public class ProvisioningJobMessage
{
    /// <summary>Loại tài nguyên: VpsInstance, ManagedDatabaseInstance, SslCertificate...</summary>
    public string ResourceType { get; set; } = string.Empty;

    public Guid ResourceId { get; set; }
    public Guid UserId { get; set; }

    /// <summary>IdempotencyKey để tránh tạo trùng khi message bị requeue.</summary>
    public string IdempotencyKey { get; set; } = string.Empty;

    /// <summary>Số lần đã thử lại (Worker tự tăng khi NACK + Requeue).</summary>
    public int RetryCount { get; set; } = 0;

    public DateTime EnqueuedAt { get; set; } = DateTime.UtcNow;
}
