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
    /// <summary>Slug của ServiceCategory — dùng để redirect đúng dashboard sau thanh toán (vps, hosting, domain, game-server, v.v.)</summary>
    public string CategorySlug { get; set; } = string.Empty;
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
    private readonly IRepository<ServicePlan> _planRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyOrdersQueryHandler(
        IRepository<OrderRequest> orderRepository,
        IRepository<ServicePlan> planRepository,
        ICurrentUserService currentUserService)
    {
        _orderRepository = orderRepository;
        _planRepository = planRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<OrderDto>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        
        var orders = await _orderRepository.WhereAsync(o => o.UserId == userId, cancellationToken, o => o.Items);
        
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<OrderStatus>(request.Status, true, out var statusEnum))
        {
            orders = orders.Where(o => o.Status == statusEnum).ToList();
        }

        var allPlanIds = orders.SelectMany(o => o.Items ?? Enumerable.Empty<OrderItem>())
            .Select(i => i.ServicePlanId)
            .Distinct()
            .ToList();

        var plans = allPlanIds.Any()
            ? await _planRepository.WhereAsync(p => allPlanIds.Contains(p.Id), cancellationToken, p => p.Category)
            : new List<ServicePlan>();
        var planDict = plans.ToDictionary(p => p.Id);

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            Status = o.Status.ToString(),
            SubTotal = o.SubTotal,
            DiscountAmount = o.DiscountAmount,
            TotalAmount = o.TotalAmount,
            AutoRenew = o.AutoRenew,
            CreatedAt = o.CreatedAt,
            Items = o.Items?.Select(i =>
            {
                planDict.TryGetValue(i.ServicePlanId, out var plan);
                return new OrderItemDto
                {
                    ServicePlanId = i.ServicePlanId,
                    ServicePlanName = plan?.Name ?? i.ServicePlan?.Name ?? ("Dịch vụ " + i.ServicePlanId.ToString()[..8]),
                    CategorySlug = plan?.Category?.Slug ?? i.ServicePlan?.Category?.Slug ?? string.Empty,
                    BillingCycle = i.BillingCycle,
                    Quantity = i.Quantity,
                    Price = i.Price
                };
            }).ToList() ?? new List<OrderItemDto>()
        }).OrderByDescending(x => x.CreatedAt).ToList();
    }
}
