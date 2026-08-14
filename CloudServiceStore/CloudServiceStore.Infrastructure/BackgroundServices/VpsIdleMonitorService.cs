using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

public class VpsIdleMonitorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<VpsIdleMonitorService> _logger;

    public VpsIdleMonitorService(
        IServiceProvider serviceProvider,
        ILogger<VpsIdleMonitorService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("VpsIdleMonitorService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndStopIdleInstancesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing VpsIdleMonitorService.");
            }

            // Run every 1 minute
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }

        _logger.LogInformation("VpsIdleMonitorService is stopping.");
    }

    private async Task CheckAndStopIdleInstancesAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var vpsRepo = scope.ServiceProvider.GetRequiredService<IRepository<VpsInstance>>();
        var provisioningService = scope.ServiceProvider.GetRequiredService<IVpsProvisioningService>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var idleThreshold = DateTime.UtcNow.AddMinutes(-20);

        // We get all running instances
        var allInstances = await vpsRepo.GetAllAsync(stoppingToken);
        var idleInstances = allInstances.Where(x => 
            x.Status == VpsInstanceStatus.Running && 
            x.LastActiveAt < idleThreshold).ToList();

        foreach (var instance in idleInstances)
        {
            if (stoppingToken.IsCancellationRequested) break;

            _logger.LogInformation("Auto-stopping idle VPS {ContainerId} (Last active: {LastActiveAt})", 
                instance.ContainerId, instance.LastActiveAt);

            try
            {
                await provisioningService.StopAsync(instance.ContainerId, stoppingToken);
                instance.Status = VpsInstanceStatus.Stopped;
                vpsRepo.Update(instance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-stop idle VPS {ContainerId}", instance.ContainerId);
            }
        }

        if (idleInstances.Any())
        {
            await uow.SaveChangesAsync(stoppingToken);
        }
    }
}
