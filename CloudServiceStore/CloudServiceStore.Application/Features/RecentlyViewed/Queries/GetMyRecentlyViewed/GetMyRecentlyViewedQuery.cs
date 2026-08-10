using MediatR;
using System;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Queries.GetMyRecentlyViewed;

public class GetMyRecentlyViewedQuery : IRequest<IEnumerable<RecentlyViewedDto>>
{
}

public class RecentlyViewedDto
{
    public Guid ServicePlanId { get; set; }
    public string PlanName { get; set; } = null!;
    public DateTime ViewedAt { get; set; }
}
