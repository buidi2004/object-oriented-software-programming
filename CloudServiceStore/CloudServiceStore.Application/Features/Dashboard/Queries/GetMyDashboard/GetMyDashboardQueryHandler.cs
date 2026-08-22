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
    private readonly IRepository<ServiceCategory> _categoryRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyDashboardQueryHandler(IRepository<OrderRequest> orderRepo, IRepository<ServicePlan> planRepo, IRepository<ServiceCategory> categoryRepo, ICurrentUserService currentUser)
    {
        _orderRepo = orderRepo;
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
        _currentUser = currentUser;
    }

    public async Task<CustomerDashboardDto> Handle(GetMyDashboardQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        // Lọc CHỈ các đơn hàng đã thanh toán thành công
        var orders = await _orderRepo.WhereAsync(o => o.UserId == userId && o.Status == OrderStatus.Paid, ct);
        
        var totalOrders = orders.Count;
        var totalSpent = orders.Sum(o => o.TotalAmount);

        var activeServices = new List<ActiveServiceDto>();
        
        foreach(var o in orders)
        {
            if (o.Items != null)
            {
                foreach(var item in o.Items)
                {
                    var plan = await _planRepo.GetByIdAsync(item.ServicePlanId, ct);
                    if (plan != null)
                    {
                        var category = await _categoryRepo.GetByIdAsync(plan.CategoryId, ct);
                        var categorySlug = category?.Slug ?? "unknown";

                        var status = "running";
                        activeServices.Add(new ActiveServiceDto(
                            o.Id,
                            plan.Name,
                            status,
                            $"103.11.{new System.Random().Next(10, 250)}.{new System.Random().Next(10, 250)}",
                            "Ubuntu 24.04 LTS",
                            plan.Cpu ?? "1",
                            plan.Ram ?? "1GB",
                            new System.Random().Next(1, 30),
                            categorySlug
                        ));
                    }
                }
            }
        }

        return new CustomerDashboardDto(totalOrders, totalSpent, activeServices);
    }
}
