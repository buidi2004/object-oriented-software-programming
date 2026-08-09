using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ServiceStatusLog : AggregateRoot
{
    public Guid? ServicePlanId { get; set; }
    public Guid? OrderRequestId { get; set; }
    public DateTime CheckedAt { get; set; }
    public bool IsUp { get; set; }
    public int ResponseTimeMs { get; set; }
    
    public ServicePlan? ServicePlan { get; set; }
    public OrderRequest? OrderRequest { get; set; }
}
