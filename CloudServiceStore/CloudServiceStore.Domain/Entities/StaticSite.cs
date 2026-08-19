using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class StaticSite : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public string BuildCommand { get; set; } = "npm run build";
    public string OutputDirectory { get; set; } = "dist";
    public string CustomDomain { get; set; } = string.Empty;
    public string DeployUrl { get; set; } = string.Empty;
    public long SourceSizeBytes { get; set; }
    public int TotalDeploys { get; set; }
    public CloudServiceStore.Domain.Enums.StaticSiteStatus Status { get; private set; } = CloudServiceStore.Domain.Enums.StaticSiteStatus.Pending;
    public string IdempotencyKey { get; set; } = "";
    public string FailureReason { get; private set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<StaticDeploy> Deploys { get; set; } = new List<StaticDeploy>();
    public AppUser? User { get; set; }

    public void MarkAsProvisioning()
    {
        if (Status != CloudServiceStore.Domain.Enums.StaticSiteStatus.Pending && Status != CloudServiceStore.Domain.Enums.StaticSiteStatus.Failed)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Provisioning từ trạng thái {Status}");
        }
        Status = CloudServiceStore.Domain.Enums.StaticSiteStatus.Provisioning;
        FailureReason = "";
    }

    public void MarkAsActive()
    {
        if (Status != CloudServiceStore.Domain.Enums.StaticSiteStatus.Provisioning)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Active từ trạng thái {Status}");
        }
        Status = CloudServiceStore.Domain.Enums.StaticSiteStatus.Active;
    }

    public void MarkAsFailed(string reason)
    {
        Status = CloudServiceStore.Domain.Enums.StaticSiteStatus.Failed;
        FailureReason = reason;
    }
}
