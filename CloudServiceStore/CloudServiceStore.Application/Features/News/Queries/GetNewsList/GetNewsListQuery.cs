using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Queries.GetNewsList;

public record NewsArticleDto(
    Guid Id, 
    string Title, 
    string Slug, 
    string Status, 
    Guid AuthorId, 
    string? ThumbnailUrl = null, 
    string? Tags = null, 
    int ViewCount = 0, 
    string? Content = null, 
    DateTime? PublishedAt = null
);

public record GetNewsListQuery(bool OnlyPublished) : IRequest<IReadOnlyList<NewsArticleDto>>;

