using CloudServiceStore.Domain.Entities;
using MediatR;
using System;

namespace CloudServiceStore.Application.Features.SupportTickets.Queries.GetTicketById;

public record GetTicketByIdQuery(Guid Id) : IRequest<SupportTicket?>;
