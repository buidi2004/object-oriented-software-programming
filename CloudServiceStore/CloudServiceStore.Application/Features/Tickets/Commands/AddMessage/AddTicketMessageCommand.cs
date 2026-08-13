using System;
using MediatR;
using FluentValidation;

namespace CloudServiceStore.Application.Features.Tickets.Commands.AddMessage;

public record AddTicketMessageCommand(Guid TicketId, string Message) : IRequest<Guid>;

public class AddTicketMessageCommandValidator : AbstractValidator<AddTicketMessageCommand>
{
    public AddTicketMessageCommandValidator()
    {
        RuleFor(x => x.TicketId).NotEmpty();
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
    }
}
