using System;
using CloudServiceStore.Domain.Enums;
using FluentValidation;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.UpdateArticle;

public record UpdateNewsArticleCommand(
    Guid Id, 
    string Title, 
    string Slug, 
    string Content, 
    string? ThumbnailUrl = null, 
    string? Tags = null, 
    ArticleStatus? Status = null
) : IRequest;

public class UpdateNewsArticleCommandValidator : AbstractValidator<UpdateNewsArticleCommand>
{
    public UpdateNewsArticleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
    }
}

