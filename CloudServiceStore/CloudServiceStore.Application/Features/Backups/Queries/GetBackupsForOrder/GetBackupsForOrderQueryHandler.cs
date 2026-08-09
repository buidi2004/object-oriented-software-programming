using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Backups.Queries.GetBackupsForOrder;

public class GetBackupsForOrderQueryHandler : IRequestHandler<GetBackupsForOrderQuery, IEnumerable<BackupJob>>
{
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<BackupJob> _backupRepo;
    private readonly ICurrentUserService _currentUser;

    public GetBackupsForOrderQueryHandler(IRepository<OrderRequest> orderRepo, IRepository<BackupJob> backupRepo, ICurrentUserService currentUser)
    { _orderRepo = orderRepo; _backupRepo = backupRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<BackupJob>> Handle(GetBackupsForOrderQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        if (order.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền xem backup của đơn hàng này.");

        return await _backupRepo.WhereAsync(b => b.OrderRequestId == request.OrderId, cancellationToken);
    }
}
