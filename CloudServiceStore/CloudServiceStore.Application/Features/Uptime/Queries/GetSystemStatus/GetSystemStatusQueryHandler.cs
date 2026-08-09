using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Uptime.Queries.GetSystemStatus;

public class GetSystemStatusQueryHandler : IRequestHandler<GetSystemStatusQuery, IEnumerable<ServiceStatusLog>>
{
    private readonly IRepository<ServiceStatusLog> _statusRepo;

    public GetSystemStatusQueryHandler(IRepository<ServiceStatusLog> statusRepo)
    { _statusRepo = statusRepo; }

    public async Task<IEnumerable<ServiceStatusLog>> Handle(GetSystemStatusQuery request, CancellationToken cancellationToken)
    {
        // Public - trả về tất cả các log trạng thái chung của hệ thống (có ServicePlanId)
        return await _statusRepo.WhereAsync(l => l.ServicePlanId != null, cancellationToken);
    }
}
