using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Commands.ApproveReview;

public record ApproveReviewCommand(Guid ReviewId) : IRequest<bool>;
