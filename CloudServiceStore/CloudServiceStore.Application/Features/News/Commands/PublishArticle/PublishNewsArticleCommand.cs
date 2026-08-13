using System;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.PublishArticle;

public record PublishNewsArticleCommand(Guid Id) : IRequest;
