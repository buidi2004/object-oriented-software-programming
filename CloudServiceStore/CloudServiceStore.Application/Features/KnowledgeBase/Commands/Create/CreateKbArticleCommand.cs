using MediatR;
using System;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;

public record CreateKbArticleCommand(
    string Title,
    string Slug,
    string Content,
    string CategoryTag,
    Guid AuthorId,
    bool IsPublished
) : IRequest<Guid>;
