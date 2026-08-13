using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.CloseTicket;

public record CloseTicketCommand(Guid TicketId) : IRequest;
