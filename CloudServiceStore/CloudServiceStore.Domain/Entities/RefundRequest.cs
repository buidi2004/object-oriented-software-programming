using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class RefundRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderRequestId { get; set; }
    public Guid UserId { get; set; }
    public string Reason { get; set; } = null!;
    public RefundRequestStatus Status { get; set; } = RefundRequestStatus.Pending;
    public decimal RefundAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
