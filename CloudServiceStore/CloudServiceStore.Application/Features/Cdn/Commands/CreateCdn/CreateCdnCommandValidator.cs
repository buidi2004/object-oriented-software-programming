using System;
using FluentValidation;

namespace CloudServiceStore.Application.Features.Cdn.Commands.CreateCdn;

public class CreateCdnCommandValidator : AbstractValidator<CreateCdnCommand>
{
    public CreateCdnCommandValidator()
    {
        RuleFor(x => x.OriginUrl)
            .NotEmpty().WithMessage("OriginUrl là bắt buộc.")
            .Must(BeAValidUrl).WithMessage("OriginUrl không đúng định dạng URL (vd: https://origin.com).");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc.")
            .MaximumLength(450).WithMessage("IdempotencyKey quá dài.");
    }

    private bool BeAValidUrl(string arg)
    {
        return Uri.TryCreate(arg, UriKind.Absolute, out var result)
               && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}
