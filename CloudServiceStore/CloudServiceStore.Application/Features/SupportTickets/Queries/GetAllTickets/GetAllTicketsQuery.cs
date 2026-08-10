using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.SupportTickets.Queries.GetAllTickets;

public record GetAllTicketsQuery() : IRequest<IEnumerable<SupportTicket>>;
