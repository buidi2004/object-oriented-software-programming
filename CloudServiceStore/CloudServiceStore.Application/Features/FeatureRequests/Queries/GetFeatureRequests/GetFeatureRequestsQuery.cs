using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.FeatureRequests.Queries.GetFeatureRequests;

public record FeatureRequestDto(
    Guid Id,
    Guid UserId,
    string Title,
    string Description,
    string Category,
    int UpvoteCount,
    string Status,
    DateTime CreatedAt,
    bool IsUpvotedByMe);

public record GetFeatureRequestsQuery(string? Status = null) : IRequest<IReadOnlyList<FeatureRequestDto>>;
