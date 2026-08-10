using System;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetById;

public record KbArticleDto(
    Guid Id,
    string Title,
    string Slug,
    string Content,
    string CategoryTag,
    int ViewCount,
    bool IsPublished,
    Guid AuthorId
);
