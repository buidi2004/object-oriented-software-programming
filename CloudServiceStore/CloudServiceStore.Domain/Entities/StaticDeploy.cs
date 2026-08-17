using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class StaticDeploy : AggregateRoot
{
    public Guid StaticSiteId { get; set; }
    public string GitCommitHash { get; set; } = string.Empty;
    public DeployStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
}
