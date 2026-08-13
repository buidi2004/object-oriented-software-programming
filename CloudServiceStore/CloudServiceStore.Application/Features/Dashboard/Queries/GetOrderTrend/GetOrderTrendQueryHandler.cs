using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetOrderTrend;

public class GetOrderTrendQueryHandler : IRequestHandler<GetOrderTrendQuery, IReadOnlyList<OrderTrendItemDto>>
{
    private readonly IRepository<OrderRequest> _orderRepo;

    public GetOrderTrendQueryHandler(IRepository<OrderRequest> orderRepo)
    {
        _orderRepo = orderRepo;
    }

    public async Task<IReadOnlyList<OrderTrendItemDto>> Handle(GetOrderTrendQuery request, CancellationToken ct)
    {
        var orders = await _orderRepo.WhereAsync(o => o.CreatedAt >= request.StartDate && o.CreatedAt <= request.EndDate, ct);
        
        var trend = orders.GroupBy(o => o.CreatedAt.Date)
            .Select(g => new OrderTrendItemDto(g.Key, g.Count()))
            .OrderBy(x => x.Date)
            .ToList();

        return trend.AsReadOnly();
    }
}
