using System;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Commands.SendChatMessage;

public record SendChatMessageCommand(Guid SessionId, string Message) : IRequest<Guid>;

public class SendChatMessageCommandValidator : AbstractValidator<SendChatMessageCommand>
{
    public SendChatMessageCommandValidator()
    {
        RuleFor(x => x.SessionId).NotEmpty();
        RuleFor(x => x.Message).NotEmpty();
    }
}
