using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.SupportTickets.Queries.GetMyTickets;

public record GetMyTicketsQuery() : IRequest<IEnumerable<SupportTicket>>;
