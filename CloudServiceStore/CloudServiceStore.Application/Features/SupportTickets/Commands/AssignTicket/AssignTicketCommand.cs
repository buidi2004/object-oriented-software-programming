using MediatR;
using System;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.AssignTicket;

public record AssignTicketCommand(Guid TicketId, Guid StaffId) : IRequest<bool>;
