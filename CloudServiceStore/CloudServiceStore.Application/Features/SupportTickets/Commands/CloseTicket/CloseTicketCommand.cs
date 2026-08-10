using MediatR;
using System;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.CloseTicket;

public record CloseTicketCommand(Guid TicketId) : IRequest<bool>;
