using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Commands.CreateReview;

public record CreateReviewCommand(Guid ServicePlanId, int Rating, string Comment) : IRequest<Guid>;
