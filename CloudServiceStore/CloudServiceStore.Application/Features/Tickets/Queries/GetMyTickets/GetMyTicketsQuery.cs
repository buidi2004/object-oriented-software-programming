using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Queries.GetMyTickets;

public record TicketSummaryDto(Guid Id, string Subject, string Status, string Priority, DateTime? CreatedAt);

public record GetMyTicketsQuery() : IRequest<IReadOnlyList<TicketSummaryDto>>;
