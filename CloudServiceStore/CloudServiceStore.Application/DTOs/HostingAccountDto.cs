namespace CloudServiceStore.Application.DTOs;

public class HostingAccountDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public string ContainerId { get; set; } = string.Empty;
    public string ControlPanelUrl { get; set; } = string.Empty;
    public int DiskUsedGb { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string UserName { get; set; } = string.Empty;
}
