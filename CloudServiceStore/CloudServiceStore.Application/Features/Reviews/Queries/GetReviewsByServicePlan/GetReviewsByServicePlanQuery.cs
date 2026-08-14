using System;
using System.Collections.Generic;
using CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Queries.GetReviewsByServicePlan;

public record GetReviewsByServicePlanQuery(Guid ServicePlanId) : IRequest<IEnumerable<ReviewDto>>;
