using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Orders.Queries.GetMyOrders;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Orders.Queries.GetOrderById;

public class OrderDetailDto : OrderDto
{
    public Guid UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
}

public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDetailDto>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDetailDto>
{
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly IRepository<AppUser> _userRepository;
    private readonly IRepository<ServicePlan> _planRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetOrderByIdQueryHandler(
        IRepository<OrderRequest> orderRepository,
        IRepository<AppUser> userRepository,
        IRepository<ServicePlan> planRepository,
        ICurrentUserService currentUserService)
    {
        _orderRepository = orderRepository;
        _userRepository = userRepository;
        _planRepository = planRepository;
        _currentUserService = currentUserService;
    }

    public async Task<OrderDetailDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var order = await _orderRepository.GetByIdAsync(request.Id, cancellationToken, o => o.Items)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");

        if (order.UserId != userId && !_currentUserService.IsInRole("Admin"))
            throw new UnauthorizedException("Bạn không có quyền xem đơn hàng này.");

        var customer = await _userRepository.GetByIdAsync(order.UserId, cancellationToken);

        var planIds = order.Items?.Select(i => i.ServicePlanId).Distinct().ToList() ?? new List<Guid>();
        var plans = planIds.Any() ? await _planRepository.WhereAsync(p => planIds.Contains(p.Id), cancellationToken, p => p.Category) : new List<ServicePlan>();
        var planDict = plans.ToDictionary(p => p.Id);

        return new OrderDetailDto
        {
            Id = order.Id,
            UserId = order.UserId,
            CustomerName = customer?.FullName ?? string.Empty,
            CustomerEmail = customer?.Email ?? string.Empty,
            Status = order.Status.ToString(),
            SubTotal = order.SubTotal,
            DiscountAmount = order.DiscountAmount,
            TotalAmount = order.TotalAmount,
            AutoRenew = order.AutoRenew,
            CreatedAt = order.CreatedAt,
            Items = order.Items?.Select(i =>
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
        };
    }
}
