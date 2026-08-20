using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

public class ResourceProvisioningWorker : BackgroundService
{
    private readonly IResourceProvisioningQueue _taskQueue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ResourceProvisioningWorker> _logger;

    public ResourceProvisioningWorker(
        IResourceProvisioningQueue taskQueue,
        IServiceProvider serviceProvider,
        ILogger<ResourceProvisioningWorker> logger)
    {
        _taskQueue = taskQueue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Resource Provisioning Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var workItem = await _taskQueue.DequeueAsync(stoppingToken);

                // Run the work item in a separate thread so it doesn't block the queue loop
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var scope = _serviceProvider.CreateScope();
                        await workItem(scope.ServiceProvider, stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred executing task work item.");
                    }
                }, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Prevent throwing if stoppingToken was signaled
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred dequeuing task work item.");
            }
        }

        _logger.LogInformation("Resource Provisioning Worker is stopping.");
    }
}
