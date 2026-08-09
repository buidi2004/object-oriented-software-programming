using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class WalletTransaction : AggregateRoot
{
    public Guid WalletId { get; private set; }
    public decimal Amount { get; private set; }
    public TransactionType Type { get; private set; }
    public Guid? RefOrderId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private WalletTransaction() { }

    public WalletTransaction(Guid walletId, decimal amount, TransactionType type, Guid? refOrderId = null)
    {
        WalletId = walletId;
        Amount = amount;
        Type = type;
        RefOrderId = refOrderId;
        CreatedAt = DateTime.UtcNow;
    }
}
