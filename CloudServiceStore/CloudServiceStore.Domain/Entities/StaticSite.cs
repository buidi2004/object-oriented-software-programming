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
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<StaticDeploy> Deploys { get; set; } = new List<StaticDeploy>();
}
