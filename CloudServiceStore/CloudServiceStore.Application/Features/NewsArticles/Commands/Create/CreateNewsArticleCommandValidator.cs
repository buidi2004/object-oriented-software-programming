using FluentValidation;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.Create;

public class CreateNewsArticleCommandValidator : AbstractValidator<CreateNewsArticleCommand>
{
    public CreateNewsArticleCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(256).WithMessage("Title must not exceed 256 characters.");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required.")
            .MaximumLength(256).WithMessage("Slug must not exceed 256 characters.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required.")
            .MinimumLength(50).WithMessage("Content must be at least 50 characters long.");

        RuleFor(x => x.AuthorId)
            .NotEmpty().WithMessage("AuthorId is required.");

        RuleFor(x => x.ThumbnailUrl)
            .MaximumLength(1000).WithMessage("ThumbnailUrl must not exceed 1000 characters.");

        RuleFor(x => x.Tags)
            .MaximumLength(500).WithMessage("Tags must not exceed 500 characters.");
    }
}
