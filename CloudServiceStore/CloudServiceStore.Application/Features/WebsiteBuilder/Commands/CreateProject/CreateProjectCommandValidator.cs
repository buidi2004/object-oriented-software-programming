using FluentValidation;

namespace CloudServiceStore.Application.Features.WebsiteBuilder.Commands.CreateProject;

public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên dự án không được để trống")
            .MaximumLength(255).WithMessage("Tên dự án không được vượt quá 255 ký tự");

        RuleFor(x => x.TemplateId)
            .NotEmpty().WithMessage("Vui lòng chọn một Template");

        RuleFor(x => x.IdempotencyKey)
            .NotEmpty().WithMessage("IdempotencyKey là bắt buộc để chống duplicate request")
            .MaximumLength(450).WithMessage("IdempotencyKey không được vượt quá 450 ký tự");
    }
}
