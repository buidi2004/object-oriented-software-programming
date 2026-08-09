using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Uptime.Queries.GetOrderUptime;

public class GetOrderUptimeQueryHandler : IRequestHandler<GetOrderUptimeQuery, IEnumerable<ServiceStatusLog>>
{
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<ServiceStatusLog> _statusRepo;
    private readonly ICurrentUserService _currentUser;

    public GetOrderUptimeQueryHandler(IRepository<OrderRequest> orderRepo, IRepository<ServiceStatusLog> statusRepo, ICurrentUserService currentUser)
    { _orderRepo = orderRepo; _statusRepo = statusRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<ServiceStatusLog>> Handle(GetOrderUptimeQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        if (order.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền xem thông tin của đơn hàng này.");

        return await _statusRepo.WhereAsync(l => l.OrderRequestId == request.OrderId, cancellationToken);
    }
}
