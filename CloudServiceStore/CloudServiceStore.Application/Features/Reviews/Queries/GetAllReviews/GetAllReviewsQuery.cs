using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews;

public record ReviewDto(
    Guid Id,
    Guid ServicePlanId,
    string ServicePlanName,
    Guid UserId,
    string UserEmail,
    int Rating,
    string Comment,
    bool IsApproved,
    bool IsFeatured,
    DateTime CreatedAt
);

public record GetAllReviewsQuery() : IRequest<IEnumerable<ReviewDto>>;
