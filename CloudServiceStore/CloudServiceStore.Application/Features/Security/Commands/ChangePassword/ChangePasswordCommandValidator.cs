using FluentValidation;

namespace CloudServiceStore.Application.Features.Security.Commands.ChangePassword;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu hiện tại.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Vui lòng nhập mật khẩu mới.")
            .MinimumLength(8).WithMessage("Mật khẩu mới phải có ít nhất 8 ký tự.")
            .Matches("[A-Z]").WithMessage("Mật khẩu mới phải có ít nhất 1 chữ hoa.")
            .Matches("[a-z]").WithMessage("Mật khẩu mới phải có ít nhất 1 chữ thường.")
            .Matches("[0-9]").WithMessage("Mật khẩu mới phải có ít nhất 1 chữ số.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt.")
            .NotEqual(x => x.CurrentPassword).WithMessage("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
    }
}
