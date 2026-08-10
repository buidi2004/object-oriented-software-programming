using FluentValidation;

namespace CloudServiceStore.Application.Features.LiveChat.Commands.SendMessage;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.ChatSessionId)
            .NotEmpty().WithMessage("ChatSessionId is required.");

        RuleFor(x => x)
            .Must(x => x.SenderId != null || !string.IsNullOrWhiteSpace(x.SenderName))
            .WithMessage("Either SenderId or SenderName must be provided.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Message content cannot be empty.")
            .MaximumLength(2000).WithMessage("Message content must not exceed 2000 characters.");
    }
}
