using System.Collections.Generic;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class SupportTicket
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? AssignedStaffId { get; set; }
    public string Subject { get; set; } = null!;
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
    
    public AppUser User { get; set; } = null!;
    public AppUser? AssignedStaff { get; set; }
    public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
}
