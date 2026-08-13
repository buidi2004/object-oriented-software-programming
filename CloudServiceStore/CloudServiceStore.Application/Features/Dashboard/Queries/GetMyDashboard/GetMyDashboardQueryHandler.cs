using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Tasks;
using System.Collections.Generic;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetMyDashboard;

public class GetMyDashboardQueryHandler : IRequestHandler<GetMyDashboardQuery, CustomerDashboardDto>
{
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyDashboardQueryHandler(IRepository<OrderRequest> orderRepo, IRepository<ServicePlan> planRepo, ICurrentUserService currentUser)
    {
        _orderRepo = orderRepo;
        _planRepo = planRepo;
        _currentUser = currentUser;
    }

    public async Task<CustomerDashboardDto> Handle(GetMyDashboardQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var orders = await _orderRepo.WhereAsync(o => o.UserId == userId && (o.Status == OrderStatus.Paid || o.Status == OrderStatus.Pending), ct);
        
        var totalOrders = orders.Count;
        var totalSpent = orders.Where(o => o.Status == OrderStatus.Paid).Sum(o => o.TotalAmount);

        var activeServices = new List<ActiveServiceDto>();
        
        foreach(var o in orders)
        {
            var plan = await _planRepo.GetByIdAsync(o.ServicePlanId, ct);
            if (plan != null)
            {
                var status = o.Status == OrderStatus.Paid ? "running" : "stopped";
                activeServices.Add(new ActiveServiceDto(
                    o.Id,
                    plan.Name,
                    status,
                    $"103.11.{new System.Random().Next(10, 250)}.{new System.Random().Next(10, 250)}",
                    "Ubuntu 24.04 LTS",
                    plan.Cpu ?? "1",
                    plan.Ram ?? "1GB",
                    status == "running" ? new System.Random().Next(1, 30) : 0
                ));
            }
        }

        return new CustomerDashboardDto(totalOrders, totalSpent, activeServices);
    }
}
