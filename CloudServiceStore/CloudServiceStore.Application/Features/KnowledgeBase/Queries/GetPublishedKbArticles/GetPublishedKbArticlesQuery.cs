using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetPublishedKbArticles;

public record KbArticleSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    string CategoryTag,
    int ViewCount);

public record GetPublishedKbArticlesQuery() : IRequest<IReadOnlyList<KbArticleSummaryDto>>;
