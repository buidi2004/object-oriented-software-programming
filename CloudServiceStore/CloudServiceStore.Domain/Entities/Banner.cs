using System;

namespace CloudServiceStore.Domain.Entities;

public class Banner
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? LinkUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
