using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetRevenueStats;

public record RevenueTrendDto(string Date, decimal Revenue, int Orders, int Users);
public record CategoryRevenueDto(string Name, decimal Revenue, string SharePercentage, string Color);

public record RevenueStatsDto(
    decimal TotalRevenue, 
    int TotalOrders, 
    int TotalUsers,
    decimal AverageOrderValue,
    List<RevenueTrendDto> DailyTrend,
    List<CategoryRevenueDto> CategoryBreakdown
);

public record GetRevenueStatsQuery(DateTime StartDate, DateTime EndDate) : IRequest<RevenueStatsDto>;
