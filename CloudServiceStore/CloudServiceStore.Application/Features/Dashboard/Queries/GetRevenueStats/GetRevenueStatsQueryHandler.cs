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

    public GetRevenueStatsQueryHandler(
        IRepository<OrderRequest> orderRepo, 
        IRepository<ServicePlan> planRepo, 
        IRepository<ServiceCategory> categoryRepo,
        IRepository<AppUser> userRepo)
    {
        _orderRepo = orderRepo;
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
        _userRepo = userRepo;
    }

    public async Task<RevenueStatsDto> Handle(GetRevenueStatsQuery request, CancellationToken ct)
    {
        var orders = await _orderRepo.WhereAsync(o => o.Status == OrderStatus.Paid && o.CreatedAt >= request.StartDate && o.CreatedAt <= request.EndDate, ct, o => o.Items);
        var users = await _userRepo.GetAllAsync(ct);
        var plans = await _planRepo.GetAllAsync(ct);
        var categories = await _categoryRepo.GetAllAsync(ct);

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;
        var totalUsers = users.Count;
        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Daily Trend
        var days = (request.EndDate - request.StartDate).Days;
        if (days <= 0) days = 1;
        var dailyTrend = new List<RevenueTrendDto>();
        for (int i = 0; i <= days; i++)
        {
            var date = request.StartDate.AddDays(i).Date;
            var dateStr = date.ToString("yyyy-MM-dd");
            var ordersOnDate = orders.Where(o => o.CreatedAt.Date == date).ToList();
            var revOnDate = ordersOnDate.Sum(o => o.TotalAmount);
            var usersOnDate = users.Count(u => u.CreatedAt.Date == date);
            dailyTrend.Add(new RevenueTrendDto(dateStr, revOnDate, ordersOnDate.Count, usersOnDate));
        }

        // Category Breakdown
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
                if (plan != null)
                {
                    if (categoryRevenues.ContainsKey(plan.CategoryId))
                    {
                        categoryRevenues[plan.CategoryId] += (item.Price * item.Quantity);
                    }
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

        return new RevenueStatsDto(totalRevenue, totalOrders, totalUsers, averageOrderValue, dailyTrend, categoryBreakdown);
    }
}
