using System;

namespace CloudServiceStore.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid ServicePlanId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = null!;
    public bool IsApproved { get; set; } = false;
    
    public ServicePlan ServicePlan { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
