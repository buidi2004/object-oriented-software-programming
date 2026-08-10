using FluentValidation;

namespace CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;

public class CreateFaqItemCommandValidator : AbstractValidator<CreateFaqItemCommand>
{
    public CreateFaqItemCommandValidator()
    {
        RuleFor(x => x.Question)
            .NotEmpty().WithMessage("Question is required.")
            .MaximumLength(500).WithMessage("Question must not exceed 500 characters.");

        RuleFor(x => x.Answer)
            .NotEmpty().WithMessage("Answer is required.")
            .MinimumLength(10).WithMessage("Answer must be at least 10 characters long.");

        RuleFor(x => x.CategoryTag)
            .NotEmpty().WithMessage("CategoryTag is required.")
            .MaximumLength(100).WithMessage("CategoryTag must not exceed 100 characters.");
    }
}
