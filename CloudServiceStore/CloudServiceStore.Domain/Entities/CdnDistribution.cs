using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class CdnDistribution : AggregateRoot
{
    public Guid UserId { get; set; }
    public string OriginUrl { get; set; } = null!;
    public string Cname { get; set; } = string.Empty;
    public bool HttpsEnabled { get; set; }
    public bool CachePurged { get; set; }
    public long TotalBandwidthBytes { get; set; }
    public int CachedRequests { get; set; }
    public CloudServiceStore.Domain.Enums.CdnStatus Status { get; private set; } = CloudServiceStore.Domain.Enums.CdnStatus.Pending;
    public string IdempotencyKey { get; set; } = "";
    public string FailureReason { get; private set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }

    public void MarkAsProvisioning()
    {
        if (Status != CloudServiceStore.Domain.Enums.CdnStatus.Pending && Status != CloudServiceStore.Domain.Enums.CdnStatus.Failed)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Provisioning từ trạng thái {Status}");
        }
        Status = CloudServiceStore.Domain.Enums.CdnStatus.Provisioning;
        FailureReason = "";
    }

    public void MarkAsActive(string cname)
    {
        if (Status != CloudServiceStore.Domain.Enums.CdnStatus.Provisioning)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Active từ trạng thái {Status}");
        }
        Status = CloudServiceStore.Domain.Enums.CdnStatus.Active;
        Cname = cname;
    }

    public void MarkAsFailed(string reason)
    {
        Status = CloudServiceStore.Domain.Enums.CdnStatus.Failed;
        FailureReason = reason;
    }
}
