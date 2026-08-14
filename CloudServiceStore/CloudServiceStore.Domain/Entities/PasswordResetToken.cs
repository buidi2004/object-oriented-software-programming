using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class PasswordResetToken : AggregateRoot
{
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; }

    public AppUser User { get; set; } = null!;

    public void MarkUsed() => IsUsed = true;

    public bool IsValid(DateTime utcNow) => !IsUsed && ExpiresAt > utcNow;
}
