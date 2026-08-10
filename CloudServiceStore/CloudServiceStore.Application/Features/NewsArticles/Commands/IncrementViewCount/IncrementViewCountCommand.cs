using MediatR;
using System;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.IncrementViewCount;

public record IncrementViewCountCommand(Guid Id) : IRequest<bool>;
