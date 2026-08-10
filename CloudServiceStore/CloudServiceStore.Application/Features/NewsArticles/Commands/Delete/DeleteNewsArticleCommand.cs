using MediatR;
using System;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.Delete;

public record DeleteNewsArticleCommand(Guid Id) : IRequest<bool>;
