using System.Collections.Generic;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ServicePlan
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = null!;
    public string? Cpu { get; set; }
    public string? Ram { get; set; }
    public string? Ssd { get; set; }
    public string? Bandwidth { get; set; }
    public string? QrCodeUrl { get; set; }
    public bool IsActive { get; set; }
    
    public ServiceCategory Category { get; set; } = null!;
    public ICollection<PlanPrice> Prices { get; set; } = new List<PlanPrice>();
    public ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
