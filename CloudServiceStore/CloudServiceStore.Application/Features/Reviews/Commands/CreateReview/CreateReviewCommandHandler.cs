using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Commands.CreateReview;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly IRepository<Review> _reviewRepo;
    private readonly IRepository<ServicePlan> _servicePlanRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;

    public CreateReviewCommandHandler(
        IRepository<Review> reviewRepo,
        IRepository<ServicePlan> servicePlanRepo,
        ICurrentUserService currentUser,
        IUnitOfWork uow)
    {
        _reviewRepo = reviewRepo;
        _servicePlanRepo = servicePlanRepo;
        _currentUser = currentUser;
        _uow = uow;
    }

    public async Task<Guid> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var plan = await _servicePlanRepo.GetByIdAsync(request.ServicePlanId, cancellationToken)
            ?? throw new NotFoundException(nameof(ServicePlan), request.ServicePlanId);

        var review = new Review
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ServicePlanId = request.ServicePlanId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow,
            IsApproved = false,
            IsFeatured = false
        };

        await _reviewRepo.AddAsync(review, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return review.Id;
    }
}
