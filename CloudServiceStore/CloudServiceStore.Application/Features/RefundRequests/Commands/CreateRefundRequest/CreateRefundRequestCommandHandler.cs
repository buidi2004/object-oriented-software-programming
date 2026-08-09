using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Commands.CreateRefundRequest;

public class CreateRefundRequestCommandHandler : IRequestHandler<CreateRefundRequestCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<RefundRequest> _refundRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly ICurrentUserService _currentUser;

    public CreateRefundRequestCommandHandler(IUnitOfWork uow, IRepository<RefundRequest> refundRepo, IRepository<OrderRequest> orderRepo, ICurrentUserService currentUser)
    { _uow = uow; _refundRepo = refundRepo; _orderRepo = orderRepo; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateRefundRequestCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        if (order.UserId != userId)
            throw new UnauthorizedException("Đơn hàng không thuộc về bạn.");
            
        if (order.Status != OrderStatus.Paid)
            throw new ConflictException("Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã thanh toán (Paid).");

        var existingRefunds = await _refundRepo.WhereAsync(r => r.OrderRequestId == request.OrderId && r.Status == RefundRequestStatus.Pending, cancellationToken);
        if (existingRefunds.Any())
            throw new ConflictException("Đơn hàng này đã có yêu cầu hoàn tiền đang chờ xử lý.");

        var refund = new RefundRequest
        {
            Id = Guid.NewGuid(),
            OrderRequestId = request.OrderId,
            UserId = userId,
            Reason = request.Reason,
            Status = RefundRequestStatus.Pending,
            RefundAmount = request.RefundAmount
        };

        await _refundRepo.AddAsync(refund, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        
        return refund.Id;
    }
}
