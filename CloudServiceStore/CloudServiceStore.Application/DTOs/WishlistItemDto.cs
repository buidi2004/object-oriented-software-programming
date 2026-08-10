using System;

namespace CloudServiceStore.Application.DTOs;

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ServicePlanId { get; set; }
    public string ServicePlanName { get; set; } = null!;
    public DateTime AddedAt { get; set; }
}
