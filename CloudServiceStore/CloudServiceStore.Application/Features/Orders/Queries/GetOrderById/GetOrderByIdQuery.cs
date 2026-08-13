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
    private readonly ICurrentUserService _currentUserService;

    public GetOrderByIdQueryHandler(
        IRepository<OrderRequest> orderRepository,
        IRepository<AppUser> userRepository,
        ICurrentUserService currentUserService)
    {
        _orderRepository = orderRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<OrderDetailDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var order = await _orderRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");

        if (order.UserId != userId && !_currentUserService.IsInRole("Admin"))
            throw new UnauthorizedException("Bạn không có quyền xem đơn hàng này.");

        var customer = await _userRepository.GetByIdAsync(order.UserId, cancellationToken);

        return new OrderDetailDto
        {
            Id = order.Id,
            UserId = order.UserId,
            CustomerName = customer?.FullName ?? string.Empty,
            CustomerEmail = customer?.Email ?? string.Empty,
            ServicePlanId = order.ServicePlanId,
            ServicePlanName = order.ServicePlan?.Name ?? "Dịch vụ " + order.ServicePlanId.ToString()[..8],
            BillingCycle = order.BillingCycle,
            Status = order.Status.ToString(),
            SubTotal = order.SubTotal,
            DiscountAmount = order.DiscountAmount,
            TotalAmount = order.TotalAmount,
            AutoRenew = order.AutoRenew,
            CreatedAt = order.CreatedAt
        };
    }
}
