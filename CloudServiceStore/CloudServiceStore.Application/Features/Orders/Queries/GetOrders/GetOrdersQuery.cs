using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Orders.Queries.GetOrders;

public class AdminOrderItemDto
{
    public string Type { get; set; } = "service";
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class AdminOrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<AdminOrderItemDto> Items { get; set; } = new();
}

public record GetOrdersQuery(string? Status = null) : IRequest<List<AdminOrderDto>>;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, List<AdminOrderDto>>
{
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly IRepository<AppUser> _userRepository;

    public GetOrdersQueryHandler(IRepository<OrderRequest> orderRepository, IRepository<AppUser> userRepository)
    {
        _orderRepository = orderRepository;
        _userRepository = userRepository;
    }

    public async Task<List<AdminOrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetAllAsync(cancellationToken);
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var userMap = users.ToDictionary(u => u.Id);

        if (!string.IsNullOrEmpty(request.Status) &&
            Enum.TryParse<CloudServiceStore.Domain.Enums.OrderStatus>(request.Status, true, out var statusEnum))
        {
            orders = orders.Where(o => o.Status == statusEnum).ToList();
        }

        return orders.Select(o =>
        {
            userMap.TryGetValue(o.UserId, out var customer);
            return new AdminOrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                CustomerName = customer?.FullName ?? "Khách hàng",
                CustomerEmail = customer?.Email ?? string.Empty,
                Status = MapStatusForFrontend(o.Status),
                TotalAmount = o.TotalAmount,
                CreatedAt = o.CreatedAt,
                Items = new List<AdminOrderItemDto>
                {
                    new()
                    {
                        Type = "service",
                        Title = o.ServicePlan?.Name ?? "Dịch vụ " + o.ServicePlanId.ToString()[..8],
                        Price = o.TotalAmount
                    }
                }
            };
        }).OrderByDescending(x => x.CreatedAt).ToList();
    }

    private static string MapStatusForFrontend(CloudServiceStore.Domain.Enums.OrderStatus status) =>
        status switch
        {
            CloudServiceStore.Domain.Enums.OrderStatus.Pending => "pending",
            CloudServiceStore.Domain.Enums.OrderStatus.Paid => "completed",
            CloudServiceStore.Domain.Enums.OrderStatus.Cancelled => "cancelled",
            CloudServiceStore.Domain.Enums.OrderStatus.Refunded => "cancelled",
            _ => "processing"
        };
}
