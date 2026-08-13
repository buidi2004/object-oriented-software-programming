using System;
using MediatR;
using FluentValidation;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;

public record CreateTicketCommand(string Subject, TicketPriority Priority) : IRequest<Guid>;

public class CreateTicketCommandValidator : AbstractValidator<CreateTicketCommand>
{
    public CreateTicketCommandValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Priority).IsInEnum();
    }
}
