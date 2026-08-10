using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Queries.GetMyRecentlyViewed;

public class GetMyRecentlyViewedQueryHandler : IRequestHandler<GetMyRecentlyViewedQuery, IEnumerable<RecentlyViewedDto>>
{
    private readonly IRepository<CloudServiceStore.Domain.Entities.RecentlyViewed> _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyRecentlyViewedQueryHandler(IRepository<CloudServiceStore.Domain.Entities.RecentlyViewed> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<RecentlyViewedDto>> Handle(GetMyRecentlyViewedQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
            throw new UnauthorizedAccessException();

        var records = await _repository.WhereAsync(r => r.UserId == _currentUserService.UserId.Value, cancellationToken);

        return records
            .OrderByDescending(r => r.ViewedAt)
            .Take(10)
            .Select(r => new RecentlyViewedDto
            {
                ServicePlanId = r.ServicePlanId,
                PlanName = r.ServicePlan?.Name ?? "Unknown Plan",
                ViewedAt = r.ViewedAt
            }).ToList();
    }
}
