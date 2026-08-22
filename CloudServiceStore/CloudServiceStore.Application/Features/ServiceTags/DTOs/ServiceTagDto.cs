namespace CloudServiceStore.Application.Features.ServiceTags.DTOs;

public class ServiceTagDto
{
    public Guid ServiceId { get; set; }
    public string ServiceType { get; set; } = string.Empty; // VPS / Domain / Hosting
    public string ServiceName { get; set; } = string.Empty;
    public string TagColor { get; set; } = "#3b82f6";
    public string? Note { get; set; }
}
