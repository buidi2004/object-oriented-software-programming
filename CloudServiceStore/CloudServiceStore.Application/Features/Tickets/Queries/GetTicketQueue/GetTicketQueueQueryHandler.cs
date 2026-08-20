using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Queries.GetTicketQueue;

public class GetTicketQueueQueryHandler : IRequestHandler<GetTicketQueueQuery, IReadOnlyList<TicketQueueDto>>
{
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly IRepository<TicketMessage> _messageRepo;
    private readonly IRepository<AppUser> _userRepo;

    public GetTicketQueueQueryHandler(
        IRepository<SupportTicket> ticketRepo,
        IRepository<TicketMessage> messageRepo,
        IRepository<AppUser> userRepo)
    {
        _ticketRepo = ticketRepo;
        _messageRepo = messageRepo;
        _userRepo = userRepo;
    }

    public async Task<IReadOnlyList<TicketQueueDto>> Handle(GetTicketQueueQuery request, CancellationToken ct)
    {
        var tickets = await _ticketRepo.GetAllAsync(ct);
        var messages = await _messageRepo.GetAllAsync(ct);
        var users = await _userRepo.GetAllAsync(ct);

        var userMap = users.ToDictionary(u => u.Id);
        var messageGroup = messages
            .GroupBy(m => m.TicketId)
            .ToDictionary(g => g.Key, g => g.OrderBy(m => m.CreatedAt).ToList());

        return tickets.Select(t =>
        {
            userMap.TryGetValue(t.UserId, out var customer);
            AppUser? assignedStaff = null;
            if (t.AssignedStaffId.HasValue)
                userMap.TryGetValue(t.AssignedStaffId.Value, out assignedStaff);

            var ticketMsgs = messageGroup.TryGetValue(t.Id, out var msgs) ? msgs : new List<TicketMessage>();
            var createdAt = ticketMsgs.FirstOrDefault()?.CreatedAt ?? DateTime.UtcNow;
            var lastMessageAt = ticketMsgs.LastOrDefault()?.CreatedAt ?? createdAt;

            return new TicketQueueDto(
                t.Id,
                t.Subject,
                MapStatus(t.Status),
                t.Priority.ToString().ToLower(),
                t.UserId,
                customer?.FullName ?? "Khách hàng",
                customer?.Email ?? "",
                "Hỗ trợ kỹ thuật",
                assignedStaff?.FullName,
                createdAt,
                lastMessageAt,
                ticketMsgs.Count,
                t.AssignedStaffId
            );
        }).OrderByDescending(t => t.LastMessageAt).ToList().AsReadOnly();
    }

    private static string MapStatus(CloudServiceStore.Domain.Enums.TicketStatus status) =>
        status switch
        {
            CloudServiceStore.Domain.Enums.TicketStatus.Open => "open",
            CloudServiceStore.Domain.Enums.TicketStatus.InProgress => "pending",
            CloudServiceStore.Domain.Enums.TicketStatus.Resolved => "closed",
            CloudServiceStore.Domain.Enums.TicketStatus.Closed => "closed",
            _ => status.ToString().ToLower()
        };
}
