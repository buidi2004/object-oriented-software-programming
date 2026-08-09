using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Commands.RejectRefundRequest;

public class RejectRefundRequestCommandHandler : IRequestHandler<RejectRefundRequestCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<RefundRequest> _refundRepo;

    public RejectRefundRequestCommandHandler(IUnitOfWork uow, IRepository<RefundRequest> refundRepo)
    { _uow = uow; _refundRepo = refundRepo; }

    public async Task<bool> Handle(RejectRefundRequestCommand request, CancellationToken cancellationToken)
    {
        var refund = await _refundRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Yêu cầu hoàn tiền không tồn tại.");

        if (refund.Status != RefundRequestStatus.Pending)
            throw new ConflictException("Yêu cầu này không ở trạng thái chờ xử lý.");

        refund.Status = RefundRequestStatus.Rejected;
        refund.UpdatedAt = DateTime.UtcNow;
        
        _refundRepo.Update(refund);
        await _uow.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
