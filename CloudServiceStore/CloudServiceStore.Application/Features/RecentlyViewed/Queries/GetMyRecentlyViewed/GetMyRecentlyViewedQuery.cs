using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Queries.GetMyRecentlyViewed;

public record RecentlyViewedDto(Guid ServicePlanId, DateTime ViewedAt);

public record GetMyRecentlyViewedQuery() : IRequest<IReadOnlyList<RecentlyViewedDto>>;
