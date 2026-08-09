using System;

namespace CloudServiceStore.Domain.Entities;

public class NewsletterSubscriber
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!; // unique
    public DateTime SubscribedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
