using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetRevenueStats;

public record RevenueStatsDto(decimal TotalRevenue, int TotalOrders);

public record GetRevenueStatsQuery(DateTime StartDate, DateTime EndDate) : IRequest<RevenueStatsDto>;
