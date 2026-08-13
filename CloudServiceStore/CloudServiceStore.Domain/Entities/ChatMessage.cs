using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class ChatMessage : AggregateRoot
{
    public Guid SessionId { get; set; }
    public Guid SenderId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ChatSession Session { get; set; } = null!;
    public AppUser Sender { get; set; } = null!;
}
