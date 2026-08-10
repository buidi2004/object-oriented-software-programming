using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AutoRenew.Commands.ToggleAutoRenew;

public class ToggleAutoRenewCommandHandler : IRequestHandler<ToggleAutoRenewCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly ICurrentUserService _currentUser;

    public ToggleAutoRenewCommandHandler(IUnitOfWork uow, IRepository<OrderRequest> orderRepo, ICurrentUserService currentUser)
    { _uow = uow; _orderRepo = orderRepo; _currentUser = currentUser; }

    public async Task<bool> Handle(ToggleAutoRenewCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        if (order.UserId != userId)
            throw new UnauthorizedException("Đơn hàng không thuộc về bạn.");

        order.ToggleAutoRenew(!order.AutoRenew);
        _orderRepo.Update(order);
        await _uow.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
