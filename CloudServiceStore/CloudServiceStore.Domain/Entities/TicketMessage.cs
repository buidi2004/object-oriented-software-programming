using System;

namespace CloudServiceStore.Domain.Entities;

public class TicketMessage
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public Guid SenderId { get; set; }
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    
    public SupportTicket Ticket { get; set; } = null!;
    public AppUser Sender { get; set; } = null!;
}
