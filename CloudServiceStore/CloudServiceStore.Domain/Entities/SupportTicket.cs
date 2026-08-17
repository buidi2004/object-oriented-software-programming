using CloudServiceStore.Domain.Primitives;
using System.Collections.Generic;
using System;
using CloudServiceStore.Domain.Enums;
using System.Linq;

namespace CloudServiceStore.Domain.Entities;

public class SupportTicket : AggregateRoot
{
    public Guid UserId { get; internal set; }
    public Guid? AssignedStaffId { get; internal set; }
    public string Subject { get; internal set; } = null!;
    public TicketStatus Status { get; internal set; }
    public TicketPriority Priority { get; internal set; }
    
    public AppUser User { get; internal set; } = null!;
    public AppUser? AssignedStaff { get; internal set; }

    private readonly List<TicketMessage> _messages = new();
    public IReadOnlyCollection<TicketMessage> Messages => _messages.AsReadOnly();

    internal SupportTicket() { }

    public SupportTicket(Guid userId, string subject, TicketPriority priority)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Subject = subject;
        Priority = priority;
        Status = TicketStatus.Open;
    }

    public void AssignStaff(Guid staffId)
    {
        if (Status == TicketStatus.Closed)
            throw new InvalidOperationException("Không thể gán nhân viên cho ticket đã đóng.");

        AssignedStaffId = staffId;
        Status = TicketStatus.InProgress;
    }

    public void AddMessage(Guid senderId, string messageContent, string? attachmentUrl = null)
    {
        if (Status == TicketStatus.Closed)
            throw new InvalidOperationException("Không thể trả lời ticket đã đóng.");

        var message = new TicketMessage(Id, senderId, messageContent, attachmentUrl);
        _messages.Add(message);
    }

    public void CloseTicket()
    {
        if (Status == TicketStatus.Closed)
            return;

        Status = TicketStatus.Closed;
    }
}
