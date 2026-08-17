using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class EmailHostingAccount : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Domain { get; set; } = null!;
    public int MaxMailboxes { get; set; }
    public int MailboxSizeMb { get; set; }
    public decimal Price { get; set; }
    public bool HasCustomDomain { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}
