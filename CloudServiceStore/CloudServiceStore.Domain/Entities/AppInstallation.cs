using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class AppInstallation : AggregateRoot
{
    public Guid UserId { get; set; }
    public Guid TemplateId { get; set; }
    public Guid HostingAccountId { get; set; }
    public string ContainerId { get; set; } = string.Empty;
    public string InstallUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }
    public AppTemplate? Template { get; set; }
    public HostingAccount? HostingAccount { get; set; }
}
