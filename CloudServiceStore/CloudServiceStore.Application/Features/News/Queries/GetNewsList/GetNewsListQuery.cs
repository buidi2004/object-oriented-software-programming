using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Queries.GetNewsList;

public record NewsArticleDto(Guid Id, string Title, string Slug, string Status, Guid AuthorId);

public record GetNewsListQuery(bool OnlyPublished) : IRequest<IReadOnlyList<NewsArticleDto>>;
