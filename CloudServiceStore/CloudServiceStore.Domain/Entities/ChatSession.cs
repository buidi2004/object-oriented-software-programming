using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class ChatSession : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Status { get; set; } = "Open"; // Open, Closed
    public DateTime CreatedAt { get; set; }

    public AppUser User { get; set; } = null!;
}
