using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Queries.GetMyReviews;

public class GetMyReviewsQueryHandler : IRequestHandler<GetMyReviewsQuery, IEnumerable<ReviewDto>>
{
    private readonly IRepository<Review> _repo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUserService;

    public GetMyReviewsQueryHandler(
        IRepository<Review> repo, 
        IRepository<ServicePlan> planRepo,
        IRepository<AppUser> userRepo,
        ICurrentUserService currentUserService)
    {
        _repo = repo;
        _planRepo = planRepo;
        _userRepo = userRepo;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<ReviewDto>> Handle(GetMyReviewsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (currentUserId == System.Guid.Empty)
        {
            return Enumerable.Empty<ReviewDto>();
        }

        var allReviews = await _repo.GetAllAsync(cancellationToken);
        var myReviews = allReviews.Where(r => r.UserId == currentUserId).ToList();
        
        var dtos = new List<ReviewDto>();
        foreach(var r in myReviews)
        {
            var plan = await _planRepo.GetByIdAsync(r.ServicePlanId, cancellationToken);
            var user = await _userRepo.GetByIdAsync(r.UserId, cancellationToken);
            
            dtos.Add(new ReviewDto(
                r.Id,
                r.ServicePlanId,
                plan?.Name ?? "Unknown Plan",
                r.UserId,
                user?.Email ?? "Unknown User",
                r.Rating,
                r.Comment,
                r.IsApproved,
                r.IsFeatured,
                r.CreatedAt
            ));
        }

        return dtos.OrderByDescending(d => d.CreatedAt);
    }
}
