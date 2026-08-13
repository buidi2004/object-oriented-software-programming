using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Reviews.Queries.GetReviewsByServicePlan;

public class GetReviewsByServicePlanQueryHandler : IRequestHandler<GetReviewsByServicePlanQuery, IEnumerable<ReviewDto>>
{
    private readonly IRepository<Review> _repo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<AppUser> _userRepo;

    public GetReviewsByServicePlanQueryHandler(
        IRepository<Review> repo, 
        IRepository<ServicePlan> planRepo,
        IRepository<AppUser> userRepo)
    {
        _repo = repo;
        _planRepo = planRepo;
        _userRepo = userRepo;
    }

    public async Task<IEnumerable<ReviewDto>> Handle(GetReviewsByServicePlanQuery request, CancellationToken cancellationToken)
    {
        var reviews = await _repo.WhereAsync(r => r.ServicePlanId == request.ServicePlanId && r.IsApproved, cancellationToken);
        
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
                user?.FullName ?? user?.Email ?? "Unknown User", // using fullname if available
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
