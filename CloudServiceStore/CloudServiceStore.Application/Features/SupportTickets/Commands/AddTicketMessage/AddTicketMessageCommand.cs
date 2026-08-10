using MediatR;
using System;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.AddTicketMessage;

public record AddTicketMessageCommand(Guid TicketId, string Message) : IRequest<bool>;
