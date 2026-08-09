using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class Review : AggregateRoot
{
    public Guid ServicePlanId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = null!;
    public bool IsApproved { get; set; } = false;
    
    public DateTime CreatedAt { get; set; }
    public bool IsFeatured { get; set; } = false;

    public ServicePlan ServicePlan { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
