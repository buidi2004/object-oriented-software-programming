using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.NewsArticles.Queries.GetById;

public record NewsArticleDto(
    Guid Id,
    string Title,
    string Slug,
    string Content,
    string? ThumbnailUrl,
    string? Tags,
    int ViewCount,
    ArticleStatus Status,
    DateTime? PublishedAt,
    Guid AuthorId
);
