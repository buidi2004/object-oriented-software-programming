using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetRevenueStats;

public class GetRevenueStatsQueryHandler : IRequestHandler<GetRevenueStatsQuery, RevenueStatsDto>
{
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<ServiceCategory> _categoryRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<CloudServiceStore.Domain.Entities.Wallet> _walletRepo;
    private readonly IRepository<WalletTransaction> _walletTxRepo;
    private readonly IRepository<RefundRequest> _refundRepo;
    private readonly IRepository<LoginHistory> _loginHistoryRepo;

    public GetRevenueStatsQueryHandler(
        IRepository<OrderRequest> orderRepo, 
        IRepository<ServicePlan> planRepo, 
        IRepository<ServiceCategory> categoryRepo,
        IRepository<AppUser> userRepo,
        IRepository<CloudServiceStore.Domain.Entities.Wallet> walletRepo,
        IRepository<WalletTransaction> walletTxRepo,
        IRepository<RefundRequest> refundRepo,
        IRepository<LoginHistory> loginHistoryRepo)
    {
        _orderRepo = orderRepo;
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
        _userRepo = userRepo;
        _walletRepo = walletRepo;
        _walletTxRepo = walletTxRepo;
        _refundRepo = refundRepo;
        _loginHistoryRepo = loginHistoryRepo;
    }

    public async Task<RevenueStatsDto> Handle(GetRevenueStatsQuery request, CancellationToken ct)
    {
        var orders = await _orderRepo.WhereAsync(o => o.Status == OrderStatus.Paid && o.CreatedAt >= request.StartDate && o.CreatedAt <= request.EndDate, ct, o => o.Items);
        var allOrders = await _orderRepo.WhereAsync(o => true, ct, o => o.Items);
        var users = await _userRepo.GetAllAsync(ct);
        var plans = await _planRepo.GetAllAsync(ct);
        var categories = await _categoryRepo.GetAllAsync(ct);
        var loginHistories = await _loginHistoryRepo.GetAllAsync(ct);

        // 1. Tiền khách mua dịch vụ (Gross Product Sales)
        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;
        var totalUsers = users.Count;
        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // 2. Tiền khách nạp ví (Wallet Top-ups)
        var walletTxs = await _walletTxRepo.WhereAsync(tx => tx.CreatedAt >= request.StartDate && tx.CreatedAt <= request.EndDate, ct);
        var totalWalletTopUp = walletTxs.Where(tx => tx.Type == TransactionType.TopUp).Sum(tx => tx.Amount);

        // 3. Tiền khách rút ví / hoàn tiền (Approved Refunds)
        var allRefunds = await _refundRepo.GetAllAsync(ct);
        var periodRefunds = allRefunds.Where(r => r.Status == RefundStatus.Approved && (r.ProcessedAt >= request.StartDate && r.ProcessedAt <= request.EndDate || r.CreatedAt >= request.StartDate && r.CreatedAt <= request.EndDate)).ToList();
        var totalRefunds = periodRefunds.Sum(r => r.Amount);

        // 4. Tổng số dư ví người dùng đang lưu hành
        var wallets = await _walletRepo.GetAllAsync(ct);
        var totalWalletBalance = wallets.Sum(w => w.Balance);

        // 5. Dòng tiền ròng thực tế
        var netCashFlow = totalRevenue + totalWalletTopUp - totalRefunds;

        // 6. Tính % Tăng/Giảm so với kỳ trước (Growth Rate)
        var periodDuration = request.EndDate - request.StartDate;
        var prevStart = request.StartDate - periodDuration;
        var prevEnd = request.StartDate;
        var prevOrders = await _orderRepo.WhereAsync(o => o.Status == OrderStatus.Paid && o.CreatedAt >= prevStart && o.CreatedAt < prevEnd, ct);
        var previousPeriodRevenue = prevOrders.Sum(o => o.TotalAmount);

        decimal growthPercentage = 0;
        bool isGrowthPositive = true;
        if (previousPeriodRevenue > 0)
        {
            var diff = totalRevenue - previousPeriodRevenue;
            var pct = (diff / previousPeriodRevenue) * 100;
            growthPercentage = Math.Round(Math.Abs(pct), 1);
            isGrowthPositive = pct >= 0;
        }
        else
        {
            growthPercentage = totalRevenue > 0 ? 100 : 0;
            isGrowthPositive = true;
        }

        // 7. Thống Kê Người Dùng (New, Active, Inactive/Dormant, Conversion Rate)
        var newUsersInPeriod = users.Count(u => u.CreatedAt >= request.StartDate && u.CreatedAt <= request.EndDate);
        
        var recentCutoff = DateTime.UtcNow.AddDays(-30);
        var activeUserIds = new HashSet<Guid>();
        foreach (var l in loginHistories.Where(lh => lh.LoginAt >= recentCutoff))
        {
            activeUserIds.Add(l.UserId);
        }
        foreach (var o in allOrders.Where(ord => ord.CreatedAt >= recentCutoff))
        {
            activeUserIds.Add(o.UserId);
        }
        foreach (var u in users.Where(usr => usr.CreatedAt >= recentCutoff))
        {
            activeUserIds.Add(u.Id);
        }

        var activeUsersInPeriod = activeUserIds.Count;
        var dormantUsersCount = Math.Max(0, totalUsers - activeUsersInPeriod);

        var payingUsersCount = allOrders.Where(o => o.Status == OrderStatus.Paid).Select(o => o.UserId).Distinct().Count();
        var userConversionRate = totalUsers > 0 ? Math.Round(((decimal)payingUsersCount / totalUsers) * 100, 1) : 0;

        // 8. Daily Trend & User Trend
        var days = (request.EndDate - request.StartDate).Days;
        if (days <= 0) days = 1;
        var dailyTrend = new List<RevenueTrendDto>();
        var userTrend = new List<UserTrendDto>();

        for (int i = 0; i <= days; i++)
        {
            var date = request.StartDate.AddDays(i).Date;
            var dateStr = date.ToString("yyyy-MM-dd");
            var ordersOnDate = orders.Where(o => o.CreatedAt.Date == date).ToList();
            var revOnDate = ordersOnDate.Sum(o => o.TotalAmount);
            var topUpOnDate = walletTxs.Where(tx => tx.Type == TransactionType.TopUp && tx.CreatedAt.Date == date).Sum(tx => tx.Amount);
            var refundOnDate = periodRefunds.Where(r => r.ProcessedAt.Date == date || (r.ProcessedAt == default && r.CreatedAt.Date == date)).Sum(r => r.Amount);
            var usersOnDate = users.Count(u => u.CreatedAt.Date == date);

            dailyTrend.Add(new RevenueTrendDto(dateStr, revOnDate, topUpOnDate, refundOnDate, ordersOnDate.Count, usersOnDate));

            // User trend on date
            var newUsersOnDay = users.Count(u => u.CreatedAt.Date == date);
            var activeOnDay = loginHistories.Count(l => l.LoginAt.Date == date) + ordersOnDate.Count + newUsersOnDay;
            var cumulativeUsersUpToDay = users.Count(u => u.CreatedAt.Date <= date);
            var dormantOnDay = Math.Max(0, cumulativeUsersUpToDay - Math.Max(1, activeOnDay));

            userTrend.Add(new UserTrendDto(dateStr, newUsersOnDay, Math.Max(newUsersOnDay, activeOnDay), dormantOnDay));
        }

        // 9. Category Breakdown
        var categoryRevenues = new Dictionary<Guid, decimal>();
        foreach (var category in categories)
        {
            categoryRevenues[category.Id] = 0;
        }

        foreach (var order in orders)
        {
            foreach (var item in order.Items)
            {
                var plan = plans.FirstOrDefault(p => p.Id == item.ServicePlanId);
                if (plan != null && categoryRevenues.ContainsKey(plan.CategoryId))
                {
                    categoryRevenues[plan.CategoryId] += (item.Price * item.Quantity);
                }
            }
        }

        var colors = new[] { "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500" };
        var categoryBreakdown = new List<CategoryRevenueDto>();
        int colorIdx = 0;
        var totalCatRev = categoryRevenues.Values.Sum();
        
        foreach (var kvp in categoryRevenues.OrderByDescending(x => x.Value))
        {
            if (kvp.Value == 0) continue;
            var cat = categories.FirstOrDefault(c => c.Id == kvp.Key);
            if (cat == null) continue;

            var share = totalCatRev > 0 ? (kvp.Value / totalCatRev) * 100 : 0;
            categoryBreakdown.Add(new CategoryRevenueDto(
                cat.Name, 
                kvp.Value, 
                $"{Math.Round(share, 1)}%", 
                colors[colorIdx % colors.Length]
            ));
            colorIdx++;
        }

        // 10. Top Selling Services
        var allPaidItems = orders.SelectMany(o => o.Items).ToList();
        var topSellingGroup = allPaidItems
            .GroupBy(item => item.ServicePlanId)
            .Select(g => {
                var plan = plans.FirstOrDefault(p => p.Id == g.Key);
                var cat = plan != null ? categories.FirstOrDefault(c => c.Id == plan.CategoryId) : null;
                var totalItemRev = g.Sum(x => x.Price * x.Quantity);
                var totalUnits = g.Sum(x => x.Quantity);
                var sharePct = totalRevenue > 0 ? $"{Math.Round((totalItemRev / totalRevenue) * 100, 1)}%" : "0%";
                
                return new TopSellingServiceDto(
                    g.Key,
                    plan?.Name ?? "Dịch vụ Cloud",
                    cat?.Name ?? "Hạ tầng",
                    totalUnits,
                    totalItemRev,
                    sharePct
                );
            })
            .OrderByDescending(x => x.TotalRevenue)
            .Take(5)
            .ToList();

        // 11. Top Refunded Services & Reasons
        var topRefundedList = new List<TopRefundedServiceDto>();
        var orderMap = allOrders.ToDictionary(o => o.Id, o => o);

        var refundsGroup = allRefunds
            .GroupBy(r => new { r.OrderId, r.Reason })
            .Select(g => {
                orderMap.TryGetValue(g.Key.OrderId, out var matchedOrder);
                var firstItem = matchedOrder?.Items.FirstOrDefault();
                var plan = firstItem != null ? plans.FirstOrDefault(p => p.Id == firstItem.ServicePlanId) : null;
                var serviceName = plan?.Name ?? (matchedOrder != null ? $"Đơn hàng #{matchedOrder.Id.ToString().Substring(0, 8).ToUpper()}" : "Gói dịch vụ Cloud");
                var sumAmount = g.Sum(r => r.Amount);
                var count = g.Count();
                var status = g.First().Status.ToString();

                return new TopRefundedServiceDto(
                    serviceName,
                    string.IsNullOrWhiteSpace(g.Key.Reason) ? "Khách hàng yêu cầu hủy dịch vụ" : g.Key.Reason,
                    count,
                    sumAmount,
                    status
                );
            })
            .OrderByDescending(x => x.TotalRefundedAmount)
            .Take(5)
            .ToList();

        return new RevenueStatsDto(
            totalRevenue, 
            totalOrders, 
            totalUsers, 
            averageOrderValue, 
            totalWalletTopUp,
            totalRefunds,
            totalWalletBalance,
            netCashFlow,
            previousPeriodRevenue,
            growthPercentage,
            isGrowthPositive,
            newUsersInPeriod,
            activeUsersInPeriod,
            dormantUsersCount,
            userConversionRate,
            dailyTrend,
            userTrend,
            categoryBreakdown,
            topSellingGroup,
            refundsGroup
        );
    }
}
