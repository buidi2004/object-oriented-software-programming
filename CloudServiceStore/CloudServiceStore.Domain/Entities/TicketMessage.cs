using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class TicketMessage : AggregateRoot
{
    public Guid TicketId { get; internal set; }
    public Guid SenderId { get; internal set; }
    public string Message { get; internal set; } = null!;
    public DateTime CreatedAt { get; internal set; }
    
    public SupportTicket Ticket { get; internal set; } = null!;
    public AppUser Sender { get; internal set; } = null!;

    internal TicketMessage() { }

    internal TicketMessage(Guid ticketId, Guid senderId, string message)
    {
        Id = Guid.NewGuid();
        TicketId = ticketId;
        SenderId = senderId;
        Message = message;
        CreatedAt = DateTime.UtcNow;
    }
}
