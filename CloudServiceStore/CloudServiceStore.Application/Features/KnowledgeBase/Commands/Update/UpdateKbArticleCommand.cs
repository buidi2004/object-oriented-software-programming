using MediatR;
using System;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.Update;

public record UpdateKbArticleCommand(
    Guid Id,
    string Title,
    string Slug,
    string Content,
    string CategoryTag,
    bool IsPublished
) : IRequest<bool>;
