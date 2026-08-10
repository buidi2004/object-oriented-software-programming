using MediatR;
using System;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.IncrementViewCount;

public record IncrementKbArticleViewCountCommand(Guid Id) : IRequest<bool>;
