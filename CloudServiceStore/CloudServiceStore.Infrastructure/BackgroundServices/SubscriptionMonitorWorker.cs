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

/// <summary>
/// Background worker to monitor subscription expirations, auto-suspend overdue resources,
/// cancel stale pending orders, and terminate resources that have been expired past the grace period (30 days).
/// </summary>
public class SubscriptionMonitorWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SubscriptionMonitorWorker> _logger;

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<Guid, DateTime> _sentReminders = new();

    public SubscriptionMonitorWorker(
        IServiceProvider serviceProvider,
        ILogger<SubscriptionMonitorWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SubscriptionMonitorWorker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessExpirationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing SubscriptionMonitorWorker.");
            }

            // Check periodically every 15 minutes
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }

        _logger.LogInformation("SubscriptionMonitorWorker is stopping.");
    }

    private async Task ProcessExpirationsAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var vpsRepo = scope.ServiceProvider.GetRequiredService<IRepository<VpsInstance>>();
        var vpsService = scope.ServiceProvider.GetRequiredService<IVpsProvisioningService>();
        var orderRepo = scope.ServiceProvider.GetRequiredService<IRepository<OrderRequest>>();
        var userRepo = scope.ServiceProvider.GetService<IRepository<AppUser>>();
        var emailService = scope.ServiceProvider.GetService<IEmailService>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var now = DateTime.UtcNow;
        var terminateThreshold = now.AddDays(-30);
        var staleOrderThreshold = now.AddDays(-7);
        var expiryWarningThreshold = now.AddDays(3);

        // 1. Process VPS Expirations & Warnings
        var allVps = await vpsRepo.GetAllAsync(stoppingToken);

        // Send Expiration Warnings (Expiring within 3 days) — at most once per 24 hours per VPS
        if (emailService != null && userRepo != null)
        {
            var expiringSoonVps = allVps.Where(v => 
                v.ExpiresAt > now && 
                v.ExpiresAt <= expiryWarningThreshold && 
                v.Status == VpsInstanceStatus.Running).ToList();

            foreach (var vps in expiringSoonVps)
            {
                if (stoppingToken.IsCancellationRequested) break;
                
                // Do not spam customer if a reminder was already sent in the last 24 hours
                if (_sentReminders.TryGetValue(vps.Id, out var lastSent) && (now - lastSent).TotalHours < 24)
                {
                    continue;
                }

                var user = await userRepo.GetByIdAsync(vps.UserId, stoppingToken);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    var daysLeft = (int)Math.Ceiling((vps.ExpiresAt - now).TotalDays);
                    await emailService.SendServiceExpiryReminderEmailAsync(
                        user.Email, 
                        vps.PlanName, 
                        daysLeft, 
                        vps.ExpiresAt, 
                        stoppingToken);
                    _sentReminders[vps.Id] = now;
                }
            }
        }
        
        // Auto-stop expired active VPS
        var expiredVps = allVps.Where(v => 
            v.ExpiresAt < now && 
            v.Status == VpsInstanceStatus.Running).ToList();

        foreach (var vps in expiredVps)
        {
            if (stoppingToken.IsCancellationRequested) break;

            _logger.LogWarning("Auto-stopping expired VPS {ContainerName} (Expired at: {ExpiresAt})", 
                vps.ContainerName, vps.ExpiresAt);

            try
            {
                await vpsService.StopAsync(vps.ContainerId, stoppingToken);
                vps.Status = VpsInstanceStatus.Stopped;
                vpsRepo.Update(vps);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-stop expired VPS {ContainerId}", vps.ContainerId);
            }
        }

        // Auto-terminate VPS expired past grace period (30 days)
        var toTerminateVps = allVps.Where(v => 
            v.ExpiresAt < terminateThreshold && 
            v.Status != VpsInstanceStatus.Terminated).ToList();

        foreach (var vps in toTerminateVps)
        {
            if (stoppingToken.IsCancellationRequested) break;

            _logger.LogCritical("Auto-terminating VPS {ContainerName} past 30-day grace period", vps.ContainerName);

            try
            {
                await vpsService.TerminateAsync(vps.ContainerId, stoppingToken);
                vps.Status = VpsInstanceStatus.Terminated;
                vpsRepo.Update(vps);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-terminate VPS {ContainerId}", vps.ContainerId);
            }
        }

        // 2. Auto-cancel stale pending orders older than 7 days
        var allOrders = await orderRepo.GetAllAsync(stoppingToken);
        var staleOrders = allOrders.Where(o => 
            o.Status == OrderStatus.Pending && 
            o.CreatedAt < staleOrderThreshold).ToList();

        foreach (var ord in staleOrders)
        {
            _logger.LogInformation("Auto-cancelling stale pending order {OrderId}", ord.Id);
            ord.Cancel();
            orderRepo.Update(ord);
        }

        await uow.SaveChangesAsync(stoppingToken);
    }
}
