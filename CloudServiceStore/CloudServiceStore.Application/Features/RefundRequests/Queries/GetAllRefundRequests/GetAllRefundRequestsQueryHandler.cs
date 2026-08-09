using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Queries.GetAllRefundRequests;

public class GetAllRefundRequestsQueryHandler : IRequestHandler<GetAllRefundRequestsQuery, IEnumerable<RefundRequest>>
{
    private readonly IRepository<RefundRequest> _refundRepo;

    public GetAllRefundRequestsQueryHandler(IRepository<RefundRequest> refundRepo)
    { _refundRepo = refundRepo; }

    public async Task<IEnumerable<RefundRequest>> Handle(GetAllRefundRequestsQuery request, CancellationToken cancellationToken)
    {
        return await _refundRepo.GetAllAsync(cancellationToken);
    }
}
