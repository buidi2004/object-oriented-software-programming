using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;

public class ProvisionVpsCommandHandler : IRequestHandler<ProvisionVpsCommand, string>
{
    private readonly IVpsProvisioningService _provisioningService;
    private readonly IRepository<VpsInstance> _vpsRepo;
    private readonly IUnitOfWork _uow;
    private readonly IJobScheduler _jobScheduler;

    public ProvisionVpsCommandHandler(
        IVpsProvisioningService provisioningService,
        IRepository<VpsInstance> vpsRepo,
        IUnitOfWork uow,
        IJobScheduler jobScheduler)
    {
        _provisioningService = provisioningService;
        _vpsRepo = vpsRepo;
        _uow = uow;
        _jobScheduler = jobScheduler;
    }

    public async Task<string> Handle(ProvisionVpsCommand request, CancellationToken cancellationToken)
    {
        // 1. Provision the VPS container
        var containerId = await _provisioningService.ProvisionAsync(request.OrderId, request.UserId, cancellationToken);
        
        if (string.IsNullOrEmpty(containerId))
        {
            throw new BadRequestException("Failed to provision VPS container.");
        }

        // 2. Save instance details to DB
        // Demo purpose: 2 minutes TTL to test quickly
        var ttl = TimeSpan.FromMinutes(2);
        
        var vpsInstance = new VpsInstance
        {
            Id = Guid.NewGuid(),
            OrderId = request.OrderId,
            UserId = request.UserId,
            ContainerId = containerId,
            ContainerName = $"vps-demo-{request.UserId}-{Guid.NewGuid().ToString().Substring(0, 8)}",
            Status = VpsInstanceStatus.Running,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.Add(ttl)
        };

        await _vpsRepo.AddAsync(vpsInstance, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        // 3. Schedule auto-cleanup
        _jobScheduler.Schedule<ITerminateVpsJob>(x => x.TerminateAsync(containerId), ttl);

        return containerId;
    }
}
