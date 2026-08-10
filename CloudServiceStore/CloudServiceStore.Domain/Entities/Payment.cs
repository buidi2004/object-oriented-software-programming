using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class Payment : AggregateRoot
{
    public Guid OrderId { get; internal set; }
    public string Gateway { get; internal set; } = null!;
    public string? TransactionRef { get; internal set; }
    public string IdempotencyKey { get; internal set; } = null!;
    public decimal Amount { get; internal set; }
    public PaymentStatus Status { get; internal set; }
    public DateTime CreatedAt { get; internal set; }
    public DateTime? ConfirmedAt { get; internal set; }
    
    public OrderRequest OrderRequest { get; internal set; } = null!;

    internal Payment() { }

    public Payment(Guid orderId, string gateway, string idempotencyKey, decimal amount)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        Gateway = gateway;
        IdempotencyKey = idempotencyKey;
        Amount = amount;
        Status = PaymentStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public void Confirm(string transactionRef)
    {
        if (Status == PaymentStatus.Confirmed)
            throw new InvalidOperationException("Thanh toán đã được xác nhận trước đó.");

        TransactionRef = transactionRef;
        Status = PaymentStatus.Confirmed;
        ConfirmedAt = DateTime.UtcNow;
    }

    public void Fail()
    {
        if (Status == PaymentStatus.Confirmed)
            throw new InvalidOperationException("Không thể đánh dấu thất bại cho thanh toán đã thành công.");

        Status = PaymentStatus.Failed;
    }
}
