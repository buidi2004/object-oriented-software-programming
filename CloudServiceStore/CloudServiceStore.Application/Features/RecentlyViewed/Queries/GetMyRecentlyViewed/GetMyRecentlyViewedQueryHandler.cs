using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Queries.GetMyRecentlyViewed;

public class GetMyRecentlyViewedQueryHandler : IRequestHandler<GetMyRecentlyViewedQuery, IReadOnlyList<RecentlyViewedDto>>
{
    private readonly IRepository<RecentlyViewedItem> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyRecentlyViewedQueryHandler(IRepository<RecentlyViewedItem> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<RecentlyViewedDto>> Handle(GetMyRecentlyViewedQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");

        var items = await _repo.WhereAsync(x => x.UserId == userId, ct);

        return items.OrderByDescending(x => x.ViewedAt)
            .Take(50)
            .Select(x => new RecentlyViewedDto(x.ServicePlanId, x.ViewedAt))
            .ToList().AsReadOnly();
    }
}
