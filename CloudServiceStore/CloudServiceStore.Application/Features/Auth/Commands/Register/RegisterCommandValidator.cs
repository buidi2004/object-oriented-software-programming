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
        
        RuleFor(x => x.FirstName).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.FirstName));
        RuleFor(x => x.LastName).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.LastName));
        RuleFor(x => x.Country).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Country));
        RuleFor(x => x.City).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.City));
        RuleFor(x => x.Ward).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Ward));
        RuleFor(x => x.AddressLine).MaximumLength(500).When(x => !string.IsNullOrEmpty(x.AddressLine));
        RuleFor(x => x.CompanyName).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.CompanyName));
        RuleFor(x => x.TaxCode).MaximumLength(50).When(x => !string.IsNullOrEmpty(x.TaxCode));
    }
}
