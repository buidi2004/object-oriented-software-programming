using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews;

public class GetAllReviewsQueryHandler : IRequestHandler<GetAllReviewsQuery, IEnumerable<ReviewDto>>
{
    private readonly IRepository<Review> _repo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<AppUser> _userRepo;

    public GetAllReviewsQueryHandler(
        IRepository<Review> repo, 
        IRepository<ServicePlan> planRepo,
        IRepository<AppUser> userRepo)
    {
        _repo = repo;
        _planRepo = planRepo;
        _userRepo = userRepo;
    }

    public async Task<IEnumerable<ReviewDto>> Handle(GetAllReviewsQuery request, CancellationToken cancellationToken)
    {
        var reviews = await _repo.GetAllAsync(cancellationToken);
        
        var dtos = new List<ReviewDto>();
        foreach(var r in reviews)
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
