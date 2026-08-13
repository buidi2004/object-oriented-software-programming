using System;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Queries.GetNewsBySlug;

public record NewsArticleDetailDto(Guid Id, string Title, string Slug, string Content, string Status, Guid AuthorId);

public record GetNewsBySlugQuery(string Slug) : IRequest<NewsArticleDetailDto>;
