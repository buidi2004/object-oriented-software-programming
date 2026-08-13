using System;
using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews; // Reuse ReviewDto

namespace CloudServiceStore.Application.Features.Reviews.Queries.GetMyReviews;

public record GetMyReviewsQuery() : IRequest<IEnumerable<ReviewDto>>;
