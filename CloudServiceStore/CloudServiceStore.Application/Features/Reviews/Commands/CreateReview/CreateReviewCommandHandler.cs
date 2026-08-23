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
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;

    public CreateReviewCommandHandler(
        IRepository<Review> reviewRepo,
        IRepository<ServicePlan> servicePlanRepo,
        IRepository<AppUser> userRepo,
        ICurrentUserService currentUser,
        IUnitOfWork uow)
    {
        _reviewRepo = reviewRepo;
        _servicePlanRepo = servicePlanRepo;
        _userRepo = userRepo;
        _currentUser = currentUser;
        _uow = uow;
    }

    public async Task<Guid> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
        {
            var users = await _userRepo.GetAllAsync(cancellationToken);
            userId = users.Count > 0 ? users[0].Id : Guid.NewGuid();
        }

        var plan = await _servicePlanRepo.GetByIdAsync(request.ServicePlanId, cancellationToken)
            ?? throw new NotFoundException(nameof(ServicePlan), request.ServicePlanId);

        var review = new Review
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            ServicePlanId = request.ServicePlanId,
            Rating = Math.Clamp(request.Rating, 1, 5),
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
