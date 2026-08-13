using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.AssignTicket;

public record AssignTicketCommand(Guid TicketId, Guid StaffId) : IRequest;
