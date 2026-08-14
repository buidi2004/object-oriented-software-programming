using System;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.CreateArticle;

public record CreateNewsArticleCommand(string Title, string Slug, string Content) : IRequest<Guid>;

public class CreateNewsArticleCommandValidator : AbstractValidator<CreateNewsArticleCommand>
{
    public CreateNewsArticleCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
    }
}
