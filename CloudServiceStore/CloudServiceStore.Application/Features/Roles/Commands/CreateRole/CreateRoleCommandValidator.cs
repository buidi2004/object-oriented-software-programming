using FluentValidation;

namespace CloudServiceStore.Application.Features.Roles.Commands.CreateRole;

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên role không được để trống.")
            .MaximumLength(50).WithMessage("Tên role không được vượt quá 50 ký tự.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Tên role chỉ được chứa chữ cái, số và dấu gạch dưới.");
    }
}
