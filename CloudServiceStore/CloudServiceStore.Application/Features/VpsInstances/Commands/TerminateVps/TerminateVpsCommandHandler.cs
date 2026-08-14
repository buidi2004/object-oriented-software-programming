using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Linq;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.TerminateVps;

public class TerminateVpsCommandHandler : IRequestHandler<TerminateVpsCommand, bool>
{
    private readonly IVpsProvisioningService _provisioningService;
    private readonly IRepository<VpsInstance> _vpsRepo;
    private readonly IUnitOfWork _uow;

    public TerminateVpsCommandHandler(
        IVpsProvisioningService provisioningService,
        IRepository<VpsInstance> vpsRepo,
        IUnitOfWork uow)
    {
        _provisioningService = provisioningService;
        _vpsRepo = vpsRepo;
        _uow = uow;
    }

    public async Task<bool> Handle(TerminateVpsCommand request, CancellationToken cancellationToken)
    {
        await _provisioningService.TerminateAsync(request.ContainerId, cancellationToken);

        // Update DB status
        var instances = await _vpsRepo.GetAllAsync(); // Using GetAllAsync because get by containerId isn't on base IRepository
        var instance = instances.FirstOrDefault(x => x.ContainerId == request.ContainerId);
        
        if (instance != null)
        {
            instance.Status = VpsInstanceStatus.Terminated;
            _vpsRepo.Update(instance);
            await _uow.SaveChangesAsync(cancellationToken);
        }

        return true;
    }
}
