using FluentValidation;

namespace CloudServiceStore.Application.Features.Auth.Commands.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password)
            .NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Mật khẩu cần ít nhất 1 chữ hoa")
            .Matches("[0-9]").WithMessage("Mật khẩu cần ít nhất 1 chữ số");
        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[0-9]{9,15}$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));
    }
}
