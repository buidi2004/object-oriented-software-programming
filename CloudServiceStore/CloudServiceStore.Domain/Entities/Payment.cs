using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }
    public Guid OrderRequestId { get; set; }
    public string Gateway { get; set; } = null!;
    public string? TransactionRef { get; set; }
    public string IdempotencyKey { get; set; } = null!;
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    
    public OrderRequest OrderRequest { get; set; } = null!;
}
