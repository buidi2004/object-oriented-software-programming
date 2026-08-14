using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Orders.Queries.GetMyOrders;

public class OrderItemDto
{
    public Guid ServicePlanId { get; set; }
    public string ServicePlanName { get; set; } = string.Empty;
    public BillingCycle BillingCycle { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class OrderDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool AutoRenew { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public record GetMyOrdersQuery(string? Status = null) : IRequest<List<OrderDto>>;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, List<OrderDto>>
{
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyOrdersQueryHandler(IRepository<OrderRequest> orderRepository, ICurrentUserService currentUserService)
    {
        _orderRepository = orderRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<OrderDto>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        
        // This is a simple query. The UI may filter by status (like ?status=Active).
        // Since we want to load the ServicePlan name, we include it.
        // IRepository may not support Includes easily in this mock if not configured, but we can try WhereAsync and manual map.
        var orders = await _orderRepository.WhereAsync(o => o.UserId == userId);
        
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<OrderStatus>(request.Status, true, out var statusEnum))
        {
            orders = orders.Where(o => o.Status == statusEnum).ToList();
        }

        // We assume we have IRepository<ServicePlan> if we can't do .Include() on IRepository directly.
        // Actually since we don't have EF tracking in this naive repo sometimes, we can just return ServicePlanName as empty if not included.
        // Let's assume EntityFramework eager loading is not guaranteed here unless we use a custom method, so we will just return basic properties.
        // Wait, the UI only needs basic properties, but "ServicePlanName" is helpful. We will leave it empty if o.ServicePlan is null.
        
        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            Status = o.Status.ToString(),
            SubTotal = o.SubTotal,
            DiscountAmount = o.DiscountAmount,
            TotalAmount = o.TotalAmount,
            AutoRenew = o.AutoRenew,
            CreatedAt = o.CreatedAt,
            Items = o.Items?.Select(i => new OrderItemDto
            {
                ServicePlanId = i.ServicePlanId,
                ServicePlanName = i.ServicePlan?.Name ?? "Dịch vụ " + i.ServicePlanId.ToString()[..8],
                BillingCycle = i.BillingCycle,
                Quantity = i.Quantity,
                Price = i.Price
            }).ToList() ?? new List<OrderItemDto>()
        }).OrderByDescending(x => x.CreatedAt).ToList();
    }
}
