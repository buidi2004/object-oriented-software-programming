using MediatR;
using System;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.Delete;

public record DeleteKbArticleCommand(Guid Id) : IRequest<bool>;
