using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ChatMessage : AggregateRoot
{
    public Guid ChatSessionId { get; private set; }
    public Guid? SenderId { get; private set; }
    public string? SenderName { get; private set; }
    public string Content { get; private set; } = null!;
    public DateTime SentAt { get; private set; }

    public ChatSession Session { get; private set; } = null!;
    public AppUser? Sender { get; private set; }

    private ChatMessage() { } // EF Core

    public ChatMessage(Guid chatSessionId, Guid? senderId, string? senderName, string content)
    {
        if (senderId == null && string.IsNullOrWhiteSpace(senderName))
            throw new ArgumentException("Either SenderId or SenderName must be provided.");

        Id = Guid.NewGuid();
        ChatSessionId = chatSessionId;
        SenderId = senderId;
        SenderName = senderName;
        Content = content;
        SentAt = DateTime.UtcNow;
    }
}
