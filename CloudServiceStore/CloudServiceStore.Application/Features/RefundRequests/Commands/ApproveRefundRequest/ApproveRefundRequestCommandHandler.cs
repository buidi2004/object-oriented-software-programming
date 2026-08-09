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

namespace CloudServiceStore.Application.Features.RefundRequests.Commands.ApproveRefundRequest;

public class ApproveRefundRequestCommandHandler : IRequestHandler<ApproveRefundRequestCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<RefundRequest> _refundRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;

    public ApproveRefundRequestCommandHandler(IUnitOfWork uow, IRepository<RefundRequest> refundRepo, IRepository<OrderRequest> orderRepo, IRepository<Domain.Entities.Wallet> walletRepo)
    { _uow = uow; _refundRepo = refundRepo; _orderRepo = orderRepo; _walletRepo = walletRepo; }

    public async Task<bool> Handle(ApproveRefundRequestCommand request, CancellationToken cancellationToken)
    {
        var refund = await _refundRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Yêu cầu hoàn tiền không tồn tại.");

        if (refund.Status != RefundRequestStatus.Pending)
            throw new ConflictException("Yêu cầu này không ở trạng thái chờ xử lý.");

        var order = await _orderRepo.GetByIdAsync(refund.OrderRequestId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");
            
        var wallets = await _walletRepo.WhereAsync(w => w.UserId == refund.UserId, cancellationToken);
        var wallet = wallets.FirstOrDefault() ?? throw new NotFoundException("Ví không tồn tại.");

        refund.Status = RefundRequestStatus.Approved;
        refund.UpdatedAt = DateTime.UtcNow;
        
        order.Status = OrderStatus.Cancelled;
        
        wallet.Balance += refund.RefundAmount;
        
        _refundRepo.Update(refund);
        _orderRepo.Update(order);
        _walletRepo.Update(wallet);
        
        await _uow.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
