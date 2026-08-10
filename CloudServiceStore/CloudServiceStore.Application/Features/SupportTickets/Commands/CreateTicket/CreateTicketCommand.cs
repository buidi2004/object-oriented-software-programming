using CloudServiceStore.Domain.Enums;
using MediatR;
using System;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.CreateTicket;

public record CreateTicketCommand(string Subject, TicketPriority Priority) : IRequest<Guid>;
