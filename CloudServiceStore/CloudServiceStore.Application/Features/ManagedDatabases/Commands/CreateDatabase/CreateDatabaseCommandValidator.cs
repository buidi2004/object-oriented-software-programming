using FluentValidation;

namespace CloudServiceStore.Application.Features.ManagedDatabases.Commands.CreateDatabase;

public class CreateDatabaseCommandValidator : AbstractValidator<CreateDatabaseCommand>
{
    public CreateDatabaseCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name không được để trống.")
            .MaximumLength(100).WithMessage("Name không được vượt quá 100 ký tự.");

        RuleFor(x => x.Engine)
            .IsInEnum().WithMessage("Engine không hợp lệ.");

        RuleFor(x => x.Version)
            .NotEmpty().WithMessage("Version không được để trống.");

        RuleFor(x => x.AdminUser)
            .NotEmpty().WithMessage("AdminUser không được để trống.");

        RuleFor(x => x.AdminPassword)
            .NotEmpty().WithMessage("AdminPassword không được để trống.")
            .MinimumLength(8).WithMessage("AdminPassword phải dài tối thiểu 8 ký tự.");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc.")
            .MaximumLength(450).WithMessage("IdempotencyKey không được vượt quá 450 ký tự.");
    }
}
