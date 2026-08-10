using CloudServiceStore.Domain.Primitives;
using System.Collections.Generic;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ServiceCategory : AggregateRoot
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public ICollection<ServicePlan> ServicePlans { get; set; } = new List<ServicePlan>();
}
