using FluentValidation;

namespace CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;

public class RequestSslCertificateCommandValidator : AbstractValidator<RequestSslCertificateCommand>
{
    public RequestSslCertificateCommandValidator()
    {
        RuleFor(x => x.DomainId)
            .NotEmpty().WithMessage("Tên miền không được để trống.");

        RuleFor(x => x.Csr)
            .NotEmpty().WithMessage("CSR không được để trống.");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc để chống request trùng lặp.")
            .MaximumLength(450).WithMessage("IdempotencyKey không được vượt quá 450 ký tự.");
    }
}
