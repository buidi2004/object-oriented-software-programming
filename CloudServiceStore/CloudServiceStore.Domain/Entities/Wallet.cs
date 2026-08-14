using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class Wallet : AggregateRoot
{
    public Guid UserId { get; private set; }
    public decimal Balance { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public byte[] RowVersion { get; private set; } = null!;

    private Wallet() { }

    public Wallet(Guid userId)
    {
        UserId = userId;
        Balance = 0;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Deposit amount must be positive.");
        Balance += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Withdraw amount must be positive.");
        if (Balance < amount) throw new InvalidOperationException("Insufficient balance.");
        Balance -= amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
