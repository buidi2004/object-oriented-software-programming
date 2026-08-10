using FluentValidation;

namespace CloudServiceStore.Application.Features.LiveChat.Commands.CreateSession;

public class CreateChatSessionCommandValidator : AbstractValidator<CreateChatSessionCommand>
{
    public CreateChatSessionCommandValidator()
    {
        RuleFor(x => x)
            .Must(x => x.UserId != null || !string.IsNullOrWhiteSpace(x.GuestName))
            .WithMessage("Either UserId or GuestName must be provided.");

        RuleFor(x => x.GuestName)
            .MaximumLength(100).WithMessage("GuestName must not exceed 100 characters.");
    }
}
