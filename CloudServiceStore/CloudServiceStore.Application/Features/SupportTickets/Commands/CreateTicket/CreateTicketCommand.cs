using CloudServiceStore.Domain.Enums;
using FluentValidation;
using MediatR;
using System;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.CreateTicket;

public record CreateTicketCommand(string Subject, TicketPriority Priority) : IRequest<Guid>;

public class CreateTicketCommandValidator : AbstractValidator<CreateTicketCommand>
{
    public CreateTicketCommandValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().WithMessage("Subject is required.").MaximumLength(200);
        RuleFor(x => x.Priority).IsInEnum();
    }
}
