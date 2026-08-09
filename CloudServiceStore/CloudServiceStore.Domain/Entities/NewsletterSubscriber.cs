using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class NewsletterSubscriber : AggregateRoot
{
    public string Email { get; set; } = null!; // unique
    public DateTime SubscribedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
