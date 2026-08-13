using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Queries.GetTicketById;

public record TicketMessageDto(
    Guid Id,
    string SenderName,
    string Content,
    DateTime Timestamp,
    bool IsAgent);

public record TicketDetailDto(
    Guid Id,
    string Subject,
    string Category,
    string Status,
    string Priority,
    Guid? AssignedStaffId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<TicketMessageDto> Messages);

public record GetTicketByIdQuery(Guid Id) : IRequest<TicketDetailDto>;

public class GetTicketByIdQueryHandler : IRequestHandler<GetTicketByIdQuery, TicketDetailDto>
{
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly IRepository<TicketMessage> _messageRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUser;

    public GetTicketByIdQueryHandler(
        IRepository<SupportTicket> ticketRepo,
        IRepository<TicketMessage> messageRepo,
        IRepository<AppUser> userRepo,
        ICurrentUserService currentUser)
    {
        _ticketRepo = ticketRepo;
        _messageRepo = messageRepo;
        _userRepo = userRepo;
        _currentUser = currentUser;
    }

    public async Task<TicketDetailDto> Handle(GetTicketByIdQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var ticket = await _ticketRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("Ticket không tồn tại.");

        var isStaff = _currentUser.IsInRole("Admin") || _currentUser.IsInRole("Staff");
        if (ticket.UserId != userId && !isStaff)
            throw new UnauthorizedException("Bạn không có quyền xem ticket này.");

        var messages = await _messageRepo.WhereAsync(m => m.TicketId == request.Id, ct);
        var users = await _userRepo.GetAllAsync(ct);
        var userMap = users.ToDictionary(u => u.Id);

        var messageDtos = messages
            .OrderBy(m => m.CreatedAt)
            .Select(m =>
            {
                userMap.TryGetValue(m.SenderId, out var sender);
                var isAgent = ticket.AssignedStaffId == m.SenderId ||
                              (sender != null && sender.Id != ticket.UserId);
                return new TicketMessageDto(
                    m.Id,
                    sender?.FullName ?? "Người dùng",
                    m.Message,
                    m.CreatedAt,
                    isAgent);
            })
            .ToList()
            .AsReadOnly();

        var createdAt = messages.FirstOrDefault()?.CreatedAt ?? DateTime.UtcNow;
        var updatedAt = messages.LastOrDefault()?.CreatedAt ?? createdAt;

        return new TicketDetailDto(
            ticket.Id,
            ticket.Subject,
            "General",
            MapStatus(ticket.Status),
            ticket.Priority.ToString().ToLower(),
            ticket.AssignedStaffId,
            createdAt,
            updatedAt,
            messageDtos);
    }

    private static string MapStatus(CloudServiceStore.Domain.Enums.TicketStatus status) =>
        status switch
        {
            CloudServiceStore.Domain.Enums.TicketStatus.Open => "open",
            CloudServiceStore.Domain.Enums.TicketStatus.InProgress => "pending",
            CloudServiceStore.Domain.Enums.TicketStatus.Closed => "closed",
            _ => status.ToString().ToLower()
        };
}
