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

namespace CloudServiceStore.Application.Features.Tickets.Queries.GetMyTickets;

public class GetMyTicketsQueryHandler : IRequestHandler<GetMyTicketsQuery, IReadOnlyList<TicketSummaryDto>>
{
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyTicketsQueryHandler(IRepository<SupportTicket> ticketRepo, ICurrentUserService currentUser)
    {
        _ticketRepo = ticketRepo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<TicketSummaryDto>> Handle(GetMyTicketsQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var tickets = await _ticketRepo.WhereAsync(t => t.UserId == userId, ct);

        return tickets.Select(t => new TicketSummaryDto(
            t.Id,
            t.Subject,
            t.Status.ToString(),
            t.Priority.ToString(),
            null // CreatedAt not tracked in current entity
        )).ToList().AsReadOnly();
    }
}
