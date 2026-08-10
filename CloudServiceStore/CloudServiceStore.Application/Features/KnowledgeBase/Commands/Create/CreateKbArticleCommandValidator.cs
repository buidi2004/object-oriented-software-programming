using FluentValidation;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;

public class CreateKbArticleCommandValidator : AbstractValidator<CreateKbArticleCommand>
{
    public CreateKbArticleCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required.")
            .MaximumLength(200).WithMessage("Slug must not exceed 200 characters.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required.")
            .MinimumLength(50).WithMessage("Content must be at least 50 characters long.");

        RuleFor(x => x.CategoryTag)
            .NotEmpty().WithMessage("CategoryTag is required.")
            .MaximumLength(100).WithMessage("CategoryTag must not exceed 100 characters.");
            
        RuleFor(x => x.AuthorId)
            .NotEmpty().WithMessage("AuthorId is required.");
    }
}
