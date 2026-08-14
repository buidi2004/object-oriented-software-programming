using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ChangeVpsState;

public class ChangeVpsStateCommandHandler : IRequestHandler<ChangeVpsStateCommand, bool>
{
    private readonly IVpsProvisioningService _provisioningService;
    private readonly IRepository<VpsInstance> _vpsRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUserService;

    public ChangeVpsStateCommandHandler(
        IVpsProvisioningService provisioningService,
        IRepository<VpsInstance> vpsRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUserService)
    {
        _provisioningService = provisioningService;
        _vpsRepo = vpsRepo;
        _uow = uow;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ChangeVpsStateCommand request, CancellationToken cancellationToken)
    {
        var instance = await _vpsRepo.GetByIdAsync(request.Id, cancellationToken);
        if (instance == null)
            throw new NotFoundException("VPS not found.");

        if (_currentUserService.UserId.HasValue 
            && instance.UserId != _currentUserService.UserId.Value 
            && !_currentUserService.IsInRole("Admin"))
        {
            throw new UnauthorizedException("Not authorized to manage this VPS.");
        }

        if (instance.Status == VpsInstanceStatus.Terminated)
            throw new BadRequestException("Cannot change state of a terminated VPS.");

        if (string.IsNullOrEmpty(instance.ContainerId))
            throw new BadRequestException("VPS does not have a valid container.");

        var action = request.Action.ToLowerInvariant();
        switch (action)
        {
            case "start":
                await _provisioningService.StartAsync(instance.ContainerId, cancellationToken);
                instance.Status = VpsInstanceStatus.Running;
                instance.LastActiveAt = DateTime.UtcNow;
                break;
            case "stop":
                await _provisioningService.StopAsync(instance.ContainerId, cancellationToken);
                instance.Status = VpsInstanceStatus.Stopped;
                break;
            case "restart":
                await _provisioningService.RestartAsync(instance.ContainerId, cancellationToken);
                instance.Status = VpsInstanceStatus.Running;
                instance.LastActiveAt = DateTime.UtcNow;
                break;
            default:
                throw new BadRequestException("Invalid action.");
        }

        _vpsRepo.Update(instance);
        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
