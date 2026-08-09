using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Queries.GetMyRefundRequests;

public class GetMyRefundRequestsQueryHandler : IRequestHandler<GetMyRefundRequestsQuery, IEnumerable<RefundRequest>>
{
    private readonly IRepository<RefundRequest> _refundRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyRefundRequestsQueryHandler(IRepository<RefundRequest> refundRepo, ICurrentUserService currentUser)
    { _refundRepo = refundRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<RefundRequest>> Handle(GetMyRefundRequestsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        return await _refundRepo.WhereAsync(r => r.UserId == userId, cancellationToken);
    }
}
