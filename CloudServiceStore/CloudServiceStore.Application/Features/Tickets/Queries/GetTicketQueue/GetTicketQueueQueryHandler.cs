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

    public GetTicketQueueQueryHandler(IRepository<SupportTicket> ticketRepo)
    {
        _ticketRepo = ticketRepo;
    }

    public async Task<IReadOnlyList<TicketQueueDto>> Handle(GetTicketQueueQuery request, CancellationToken ct)
    {
        var tickets = await _ticketRepo.GetAllAsync(ct);

        return tickets.Select(t => new TicketQueueDto(
            t.Id,
            t.Subject,
            t.Status.ToString(),
            t.Priority.ToString(),
            t.UserId,
            t.AssignedStaffId
        )).ToList().AsReadOnly();
    }
}
