using System;

namespace CloudServiceStore.Domain.Entities;

public class Promotion
{
    public Guid Id { get; set; }
    public Guid? ServicePlanId { get; set; } // Null = Toàn site
    public decimal DiscountPercent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public ServicePlan? ServicePlan { get; set; }
}
