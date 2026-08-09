using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Commands.CreateMigration;

public class CreateMigrationCommandHandler : IRequestHandler<CreateMigrationCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<MigrationRequest> _migrationRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly ICurrentUserService _currentUser;

    public CreateMigrationCommandHandler(IUnitOfWork uow, IRepository<MigrationRequest> migrationRepo, IRepository<OrderRequest> orderRepo, ICurrentUserService currentUser)
    { _uow = uow; _migrationRepo = migrationRepo; _orderRepo = orderRepo; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateMigrationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        if (order.UserId != userId)
            throw new UnauthorizedException("Đơn hàng không thuộc về bạn.");
            
        var migration = new MigrationRequest
        {
            UserId = userId,
            OrderRequestId = request.OrderId,
            FromProvider = request.FromProvider,
            Note = request.Note
        };
        
        await _migrationRepo.AddAsync(migration, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        
        return migration.Id;
    }
}
