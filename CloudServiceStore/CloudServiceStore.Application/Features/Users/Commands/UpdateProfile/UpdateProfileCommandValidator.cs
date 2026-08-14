using FluentValidation;

namespace CloudServiceStore.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ và tên không được để trống.")
            .MaximumLength(100).WithMessage("Họ và tên không được vượt quá 100 ký tự.");
            
        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Số điện thoại không được vượt quá 20 ký tự.");
            
        RuleFor(x => x.FirstName)
            .MaximumLength(50).WithMessage("Tên không được vượt quá 50 ký tự.");
            
        RuleFor(x => x.LastName)
            .MaximumLength(50).WithMessage("Họ không được vượt quá 50 ký tự.");
    }
}
