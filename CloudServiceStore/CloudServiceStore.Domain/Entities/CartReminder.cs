using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class CartReminder : AggregateRoot
{
    public Guid CartId { get; set; }
    public Guid UserId { get; set; }
    public DateTime SentAt { get; set; }
    public string Status { get; set; } = string.Empty;

    public Cart Cart { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
