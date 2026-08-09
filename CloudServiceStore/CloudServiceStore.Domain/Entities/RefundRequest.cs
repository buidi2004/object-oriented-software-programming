using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class RefundRequest : AggregateRoot
{
    public Guid OrderId { get; internal set; }
    public Guid UserId { get; internal set; }
    public string Reason { get; internal set; } = null!;
    public RefundStatus Status { get; internal set; }
    public decimal Amount { get; internal set; }
    public DateTime CreatedAt { get; internal set; }
    public DateTime ProcessedAt { get; internal set; }

    internal RefundRequest() { }

    public RefundRequest(Guid orderId, Guid userId, string reason, decimal amount)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        UserId = userId;
        Reason = reason;
        Amount = amount;
        Status = RefundStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        if (Status != RefundStatus.Pending)
            throw new InvalidOperationException("Chỉ có thể xử lý yêu cầu đang chờ duyệt.");

        Status = RefundStatus.Approved;
        ProcessedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != RefundStatus.Pending)
            throw new InvalidOperationException("Chỉ có thể xử lý yêu cầu đang chờ duyệt.");

        Status = RefundStatus.Rejected;
        ProcessedAt = DateTime.UtcNow;
    }
}
