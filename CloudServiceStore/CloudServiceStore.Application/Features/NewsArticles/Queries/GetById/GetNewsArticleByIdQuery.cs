using MediatR;
using System;

namespace CloudServiceStore.Application.Features.NewsArticles.Queries.GetById;

public record GetNewsArticleByIdQuery(Guid Id) : IRequest<NewsArticleDto>;
