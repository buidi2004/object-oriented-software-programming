using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Models;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Application.Features.VpsInstances.Commands.ChangeVpsState;

public class ChangeVpsStateCommandHandler : IRequestHandler<ChangeVpsStateCommand, bool>
{
    private readonly IVpsProvisioningService _provisioningService;
    private readonly IRepository<VpsInstance> _vpsRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUserService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChangeVpsStateCommandHandler> _logger;

    public ChangeVpsStateCommandHandler(
        IVpsProvisioningService provisioningService,
        IRepository<VpsInstance> vpsRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUserService,
        IConfiguration configuration,
        ILogger<ChangeVpsStateCommandHandler> logger)
    {
        _provisioningService = provisioningService;
        _vpsRepo = vpsRepo;
        _uow = uow;
        _currentUserService = currentUserService;
        _configuration = configuration;
        _logger = logger;
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

        var action = request.Action.ToLowerInvariant();

        // If ContainerId is empty/null, attempt to re-provision the container automatically
        if (string.IsNullOrEmpty(instance.ContainerId))
        {
            _logger.LogWarning("VPS {VpsId} has no ContainerId. Attempting auto re-provision...", instance.Id);

            if (action == "stop")
            {
                // Nothing to stop, just update status
                instance.Status = VpsInstanceStatus.Stopped;
                _vpsRepo.Update(instance);
                await _uow.SaveChangesAsync(cancellationToken);
                return true;
            }

            // Re-provision the container
            var result = await ReProvisionContainerAsync(instance, cancellationToken);
            if (!result)
            {
                throw new BadRequestException(
                    "VPS container không tồn tại và không thể tự động tạo lại. Vui lòng liên hệ hỗ trợ kỹ thuật.");
            }

            // After re-provisioning, container is already running
            if (action == "start" || action == "restart")
            {
                instance.Status = VpsInstanceStatus.Running;
                instance.LastActiveAt = DateTime.UtcNow;
                _vpsRepo.Update(instance);
                await _uow.SaveChangesAsync(cancellationToken);
                return true;
            }
        }

        // Container exists – check if it still exists in Docker, if not re-provision
        var isRunning = await _provisioningService.IsRunningAsync(instance.ContainerId, cancellationToken);
        
        switch (action)
        {
            case "start":
                try
                {
                    await _provisioningService.StartAsync(instance.ContainerId, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to start container {ContainerId}. Attempting re-provision...", instance.ContainerId);
                    var reProvResult = await ReProvisionContainerAsync(instance, cancellationToken);
                    if (!reProvResult)
                    {
                        throw new BadRequestException(
                            "Không thể khởi động VPS. Container đã bị xóa và không thể tạo lại. Liên hệ hỗ trợ.");
                    }
                }
                instance.Status = VpsInstanceStatus.Running;
                instance.LastActiveAt = DateTime.UtcNow;
                break;
            case "stop":
                try
                {
                    await _provisioningService.StopAsync(instance.ContainerId, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to stop container {ContainerId}, marking as Stopped anyway.", instance.ContainerId);
                }
                instance.Status = VpsInstanceStatus.Stopped;
                break;
            case "restart":
                try
                {
                    await _provisioningService.RestartAsync(instance.ContainerId, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to restart container {ContainerId}. Attempting re-provision...", instance.ContainerId);
                    var reProvResult = await ReProvisionContainerAsync(instance, cancellationToken);
                    if (!reProvResult)
                    {
                        throw new BadRequestException(
                            "Không thể khởi động lại VPS. Container đã bị xóa và không thể tạo lại. Liên hệ hỗ trợ.");
                    }
                }
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

    /// <summary>
    /// Re-provisions a Docker container for a VPS instance whose container was lost/deleted.
    /// Updates the instance's ContainerId and ContainerName in-place.
    /// </summary>
    private async Task<bool> ReProvisionContainerAsync(VpsInstance instance, CancellationToken ct)
    {
        try
        {
            var isDockerAvailable = await _provisioningService.IsAvailableAsync(ct);
            if (!isDockerAvailable)
            {
                _logger.LogError("Docker is not available. Cannot re-provision VPS {VpsId}.", instance.Id);
                return false;
            }

            var imageName = _configuration["Vps:DefaultImage"] ?? "vps-demo-image";
            var shortId = instance.Id.ToString("N")[..8];
            var containerName = $"vps-{instance.PlanName?.ToLowerInvariant().Replace(" ", "-") ?? "cloud-vps"}-{shortId}";

            var spec = new VpsProvisionSpec(
                ContainerName: containerName,
                CpuCores: instance.CpuCores > 0 ? instance.CpuCores : 1,
                MemoryBytes: instance.RamMb > 0 ? instance.RamMb * 1024L * 1024L : 512L * 1024L * 1024L,
                DiskGb: instance.DiskGb ?? 20,
                ImageName: imageName
            );

            _logger.LogInformation("Re-provisioning container for VPS {VpsId} with name {ContainerName}...", instance.Id, containerName);

            var result = await _provisioningService.ProvisionAsync(spec, ct);
            if (result.Success)
            {
                instance.ContainerId = result.ContainerId;
                instance.ContainerName = result.ContainerName;
                _logger.LogInformation("Successfully re-provisioned VPS {VpsId} with new container {ContainerId}.", instance.Id, result.ContainerId);
                return true;
            }
            else
            {
                _logger.LogError("Failed to re-provision VPS {VpsId}: {Error}", instance.Id, result.ErrorMessage);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during re-provisioning VPS {VpsId}.", instance.Id);
            return false;
        }
    }
}
