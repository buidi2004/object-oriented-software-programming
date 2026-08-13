using System;
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

    public GetRevenueStatsQueryHandler(IRepository<OrderRequest> orderRepo)
    {
        _orderRepo = orderRepo;
    }

    public async Task<RevenueStatsDto> Handle(GetRevenueStatsQuery request, CancellationToken ct)
    {
        var orders = await _orderRepo.WhereAsync(o => o.Status == OrderStatus.Paid && o.CreatedAt >= request.StartDate && o.CreatedAt <= request.EndDate, ct);
        
        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;

        return new RevenueStatsDto(totalRevenue, totalOrders);
    }
}
