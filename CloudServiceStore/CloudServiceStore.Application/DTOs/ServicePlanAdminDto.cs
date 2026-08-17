using System;

namespace CloudServiceStore.Application.DTOs;

public class ServicePlanAdminDto
{
    public Guid ServicePlanId { get; set; }
    public string ServicePlanName { get; set; } = null!;
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? Cpu { get; set; }
    public string? Ram { get; set; }
    public string? Ssd { get; set; }
    public string? Bandwidth { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}
