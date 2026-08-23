using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetRevenueStats;

public record RevenueTrendDto(string Date, decimal Revenue, decimal WalletTopUp, decimal Refunds, int Orders, int Users);
public record UserTrendDto(string Date, int NewUsers, int ActiveUsers, int DormantUsers);
public record CategoryRevenueDto(string Name, decimal Revenue, string SharePercentage, string Color);

public record TopSellingServiceDto(
    Guid PlanId, 
    string PlanName, 
    string CategoryName, 
    int TotalUnitsSold, 
    decimal TotalRevenue, 
    string RevenueSharePercentage
);

public record TopRefundedServiceDto(
    string ServiceName, 
    string Reason, 
    int RefundCount, 
    decimal TotalRefundedAmount, 
    string Status
);

public record RevenueStatsDto(
    decimal TotalRevenue, 
    int TotalOrders, 
    int TotalUsers,
    decimal AverageOrderValue,
    decimal TotalWalletTopUp,
    decimal TotalRefunds,
    decimal TotalWalletBalance,
    decimal NetCashFlow,
    decimal PreviousPeriodRevenue,
    decimal GrowthPercentage,
    bool IsGrowthPositive,
    int NewUsersInPeriod,
    int ActiveUsersInPeriod,
    int DormantUsersCount,
    decimal UserConversionRate,
    List<RevenueTrendDto> DailyTrend,
    List<UserTrendDto> UserTrend,
    List<CategoryRevenueDto> CategoryBreakdown,
    List<TopSellingServiceDto> TopSellingServices,
    List<TopRefundedServiceDto> TopRefundedServices
);

public record GetRevenueStatsQuery(DateTime StartDate, DateTime EndDate) : IRequest<RevenueStatsDto>;
