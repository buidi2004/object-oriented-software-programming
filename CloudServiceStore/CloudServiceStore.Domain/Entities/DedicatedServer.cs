using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class DedicatedServer : AggregateRoot
{
    public Guid UserId { get; set; }
    public string ServerName { get; set; } = null!;
    public string CpuModel { get; set; } = string.Empty;
    public int RamGb { get; set; }
    public long DiskBytes { get; set; }
    public string OsImage { get; set; } = "Ubuntu 24.04 LTS";
    public DedicatedServerStatus Status { get; set; }
    public bool RemoteAccessEnabled { get; set; }
    public DateTime ProvisionedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}
