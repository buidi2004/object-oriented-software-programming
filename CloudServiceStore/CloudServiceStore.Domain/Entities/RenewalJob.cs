using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class RenewalJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderRequestId { get; set; }
    public DateTime NextRunAt { get; set; }
    public RenewalStatus Status { get; set; } = RenewalStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
