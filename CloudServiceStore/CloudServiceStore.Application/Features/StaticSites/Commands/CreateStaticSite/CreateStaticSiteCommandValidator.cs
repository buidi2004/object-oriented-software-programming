using FluentValidation;

namespace CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;

public class CreateStaticSiteCommandValidator : AbstractValidator<CreateStaticSiteCommand>
{
    public CreateStaticSiteCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name là bắt buộc.")
            .MaximumLength(255).WithMessage("Name quá dài.");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc.")
            .MaximumLength(450).WithMessage("IdempotencyKey quá dài.");
    }
}
