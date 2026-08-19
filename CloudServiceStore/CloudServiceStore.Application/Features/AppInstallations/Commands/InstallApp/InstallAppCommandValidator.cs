using FluentValidation;

namespace CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;

public class InstallAppCommandValidator : AbstractValidator<InstallAppCommand>
{
    public InstallAppCommandValidator()
    {
        RuleFor(x => x.TemplateId)
            .NotEmpty().WithMessage("TemplateId là bắt buộc.");

        RuleFor(x => x.HostingAccountId)
            .NotEmpty().WithMessage("HostingAccountId là bắt buộc.");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc.")
            .MaximumLength(450).WithMessage("IdempotencyKey không được quá 450 ký tự.");
    }
}
