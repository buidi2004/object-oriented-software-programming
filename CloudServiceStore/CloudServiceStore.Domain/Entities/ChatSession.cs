using CloudServiceStore.Domain.Primitives;
using System;
using System.Collections.Generic;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class ChatSession : AggregateRoot
{
    public Guid? UserId { get; private set; }
    public string? GuestName { get; private set; }
    public Guid? AgentId { get; private set; }
    public ChatSessionStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? EndedAt { get; private set; }

    public AppUser? User { get; private set; }
    public AppUser? Agent { get; private set; }
    
    private readonly List<ChatMessage> _messages = new();
    public IReadOnlyCollection<ChatMessage> Messages => _messages.AsReadOnly();

    private ChatSession() { } // EF Core

    public ChatSession(Guid? userId, string? guestName)
    {
        if (userId == null && string.IsNullOrWhiteSpace(guestName))
            throw new ArgumentException("Either UserId or GuestName must be provided.");

        Id = Guid.NewGuid();
        UserId = userId;
        GuestName = guestName;
        Status = ChatSessionStatus.Active;
        StartedAt = DateTime.UtcNow;
    }

    public void AssignAgent(Guid agentId)
    {
        if (Status == ChatSessionStatus.Closed)
            throw new InvalidOperationException("Cannot assign agent to a closed session.");
            
        AgentId = agentId;
    }

    public void Close()
    {
        Status = ChatSessionStatus.Closed;
        EndedAt = DateTime.UtcNow;
    }
}
