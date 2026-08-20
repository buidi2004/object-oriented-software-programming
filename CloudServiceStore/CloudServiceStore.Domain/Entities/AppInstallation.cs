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
    public CloudServiceStore.Domain.Enums.AppInstallationStatus Status { get; private set; } = CloudServiceStore.Domain.Enums.AppInstallationStatus.Pending;
    public string IdempotencyKey { get; set; } = "";
    public string FailureReason { get; private set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }
    public AppTemplate? Template { get; set; }
    public HostingAccount? HostingAccount { get; set; }

    public void MarkAsInstalling()
    {
        if (Status != CloudServiceStore.Domain.Enums.AppInstallationStatus.Pending && Status != CloudServiceStore.Domain.Enums.AppInstallationStatus.Failed)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Installing từ trạng thái {Status}");
        }
        Status = CloudServiceStore.Domain.Enums.AppInstallationStatus.Installing;
        FailureReason = "";
    }

    public void MarkAsCompleted(string installUrl)
    {
        if (Status != CloudServiceStore.Domain.Enums.AppInstallationStatus.Installing)
        {
            throw new InvalidOperationException($"Không thể chuyển sang Completed từ trạng thái {Status}");
        }
        Status = CloudServiceStore.Domain.Enums.AppInstallationStatus.Completed;
        InstallUrl = installUrl;
    }

    public void MarkAsFailed(string reason)
    {
        Status = CloudServiceStore.Domain.Enums.AppInstallationStatus.Failed;
        FailureReason = reason;
    }
}
