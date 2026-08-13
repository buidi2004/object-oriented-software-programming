using System;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Commands.DeleteArticle;

public record DeleteNewsArticleCommand(Guid Id) : IRequest;
