using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;

public class ScheduleBackupCommandHandler : IRequestHandler<ScheduleBackupCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<BackupJob> _backupRepo;
    private readonly ICurrentUserService _currentUser;

    public ScheduleBackupCommandHandler(IUnitOfWork uow, IRepository<OrderRequest> orderRepo, IRepository<BackupJob> backupRepo, ICurrentUserService currentUser)
    { _uow = uow; _orderRepo = orderRepo; _backupRepo = backupRepo; _currentUser = currentUser; }

    public async Task<Guid> Handle(ScheduleBackupCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        if (order.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền thao tác trên đơn hàng này.");

        if (order.Status != OrderStatus.Paid)
            throw new ConflictException("Đơn hàng chưa thanh toán không thể lên lịch backup.");

        var backup = new BackupJob
        {
            Id = Guid.NewGuid(),
            OrderRequestId = request.OrderId,
            ScheduledAt = request.ScheduledAt,
            Status = BackupStatus.Pending
        };

        await _backupRepo.AddAsync(backup, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return backup.Id;
    }
}
