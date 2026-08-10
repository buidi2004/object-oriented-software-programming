using System.Collections.Generic;
using CloudServiceStore.Application.Features.NewsArticles.Queries.GetById;
using MediatR;

namespace CloudServiceStore.Application.Features.NewsArticles.Queries.GetAll;

public record GetAllNewsArticlesQuery() : IRequest<IEnumerable<NewsArticleDto>>;
