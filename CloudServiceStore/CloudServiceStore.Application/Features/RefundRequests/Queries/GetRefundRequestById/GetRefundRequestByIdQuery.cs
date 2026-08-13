using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Queries.GetRefundRequestById;

public record RefundRequestDetailDto(
    Guid Id,
    Guid OrderId,
    Guid UserId,
    string CustomerName,
    string CustomerEmail,
    string Reason,
    string Status,
    decimal Amount,
    DateTime CreatedAt,
    DateTime? ProcessedAt);

public record GetRefundRequestByIdQuery(Guid Id) : IRequest<RefundRequestDetailDto>;

public class GetRefundRequestByIdQueryHandler : IRequestHandler<GetRefundRequestByIdQuery, RefundRequestDetailDto>
{
    private readonly IRepository<RefundRequest> _refundRepo;
    private readonly IRepository<AppUser> _userRepo;

    public GetRefundRequestByIdQueryHandler(IRepository<RefundRequest> refundRepo, IRepository<AppUser> userRepo)
    {
        _refundRepo = refundRepo;
        _userRepo = userRepo;
    }

    public async Task<RefundRequestDetailDto> Handle(GetRefundRequestByIdQuery request, CancellationToken ct)
    {
        var refund = await _refundRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("Yêu cầu hoàn tiền không tồn tại.");

        var user = await _userRepo.GetByIdAsync(refund.UserId, ct);

        return new RefundRequestDetailDto(
            refund.Id,
            refund.OrderId,
            refund.UserId,
            user?.FullName ?? "Khách hàng",
            user?.Email ?? string.Empty,
            refund.Reason,
            refund.Status.ToString(),
            refund.Amount,
            refund.CreatedAt,
            refund.ProcessedAt == default ? null : refund.ProcessedAt);
    }
}
