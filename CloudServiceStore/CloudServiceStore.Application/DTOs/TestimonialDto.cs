using System;

namespace CloudServiceStore.Application.DTOs;

public class TestimonialDto
{
    public Guid Id { get; set; }
    public Guid ServicePlanId { get; set; }
    public string ReviewerName { get; set; } = null!;
    public int Rating { get; set; }
    public string Comment { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
