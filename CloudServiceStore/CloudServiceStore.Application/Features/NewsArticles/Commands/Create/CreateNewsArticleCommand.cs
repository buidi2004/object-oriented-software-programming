using MediatR;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.Create;

public record CreateNewsArticleCommand(
    string Title,
    string Slug,
    string Content,
    Guid AuthorId,
    string? ThumbnailUrl = null,
    string? Tags = null,
    ArticleStatus Status = ArticleStatus.Draft
) : IRequest<Guid>;
