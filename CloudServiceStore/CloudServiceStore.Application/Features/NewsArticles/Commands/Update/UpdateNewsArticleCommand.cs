using MediatR;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.Update;

public record UpdateNewsArticleCommand(
    Guid Id,
    string Title,
    string Slug,
    string Content,
    string? ThumbnailUrl,
    string? Tags,
    ArticleStatus Status
) : IRequest<bool>;
