using FluentValidation;

namespace CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;

public class CreateGameServerCommandValidator : AbstractValidator<CreateGameServerCommand>
{
    public CreateGameServerCommandValidator()
    {
        RuleFor(x => x.ServerName)
            .NotEmpty().WithMessage("ServerName không được để trống.")
            .MaximumLength(100).WithMessage("ServerName không được quá 100 ký tự.");

        RuleFor(x => x.GameType)
            .IsInEnum().WithMessage("GameType không hợp lệ.");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc.")
            .MaximumLength(450).WithMessage("IdempotencyKey không được quá 450 ký tự.");
    }
}
