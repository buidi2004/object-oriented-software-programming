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
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
