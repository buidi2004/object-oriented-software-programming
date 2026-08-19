using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class TwoFactorBackupCode : AggregateRoot
{
    public Guid UserId { get; private set; }
    public string CodeHash { get; private set; } = null!;
    public bool IsUsed { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UsedAt { get; private set; }

    public AppUser User { get; private set; } = null!;

    internal TwoFactorBackupCode() { }

    public TwoFactorBackupCode(Guid userId, string codeHash)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        CodeHash = codeHash;
        IsUsed = false;
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkAsUsed()
    {
        IsUsed = true;
        UsedAt = DateTime.UtcNow;
    }
}
