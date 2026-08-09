using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class RenewalJob : AggregateRoot
{
    public Guid OrderRequestId { get; set; }
    public DateTime NextRunAt { get; set; }
    public RenewalStatus Status { get; set; } = RenewalStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
