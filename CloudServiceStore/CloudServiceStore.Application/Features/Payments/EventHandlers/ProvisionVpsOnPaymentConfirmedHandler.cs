using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.Payments.EventHandlers;

public class ProvisionVpsOnPaymentConfirmedHandler : INotificationHandler<PaymentConfirmedEvent>
{
    private readonly IMediator _mediator;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<ServiceCategory> _categoryRepo;
    private readonly IRepository<GameServerInstance> _gameServerRepo;
    private readonly IRepository<DedicatedServer> _dedicatedServerRepo;
    private readonly IRepository<ManagedDatabaseInstance> _databaseRepo;
    private readonly IRepository<HostingAccount> _hostingRepo;
    private readonly IRepository<ObjectStorageBucket> _storageRepo;
    private readonly IGameServerProvisioningService _gameProvisioningService;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<ProvisionVpsOnPaymentConfirmedHandler> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public ProvisionVpsOnPaymentConfirmedHandler(
        IMediator mediator,
        IRepository<OrderRequest> orderRepo,
        IRepository<ServicePlan> planRepo,
        IRepository<ServiceCategory> categoryRepo,
        IRepository<GameServerInstance> gameServerRepo,
        IRepository<DedicatedServer> dedicatedServerRepo,
        IRepository<ManagedDatabaseInstance> databaseRepo,
        IRepository<HostingAccount> hostingRepo,
        IRepository<ObjectStorageBucket> storageRepo,
        IGameServerProvisioningService gameProvisioningService,
        IUnitOfWork uow,
        ILogger<ProvisionVpsOnPaymentConfirmedHandler> logger,
        IServiceScopeFactory scopeFactory)
    {
        _mediator = mediator;
        _orderRepo = orderRepo;
        _planRepo = planRepo;
        _categoryRepo = categoryRepo;
        _gameServerRepo = gameServerRepo;
        _dedicatedServerRepo = dedicatedServerRepo;
        _databaseRepo = databaseRepo;
        _hostingRepo = hostingRepo;
        _storageRepo = storageRepo;
        _gameProvisioningService = gameProvisioningService;
        _uow = uow;
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    public async Task Handle(PaymentConfirmedEvent notification, CancellationToken cancellationToken)
    {
        var order = await _orderRepo.GetByIdAsync(notification.OrderRequestId, cancellationToken, o => o.Items!);
        if (order == null || order.Status != OrderStatus.Paid || order.Items == null || !order.Items.Any())
        {
            return;
        }

        var planIds = order.Items.Select(i => i.ServicePlanId).Distinct().ToList();
        var plans = await _planRepo.WhereAsync(p => planIds.Contains(p.Id), cancellationToken, p => p.Category!);
        var planDict = plans.ToDictionary(p => p.Id);

        bool hasVps = false;

        foreach (var item in order.Items)
        {
            planDict.TryGetValue(item.ServicePlanId, out var plan);
            var categorySlug = plan?.Category?.Slug?.ToLower() ?? "";
            var planName = plan?.Name ?? "";
            int monthsToAdd = item.BillingCycle == BillingCycle.Yearly ? 12 : 1;

            // 1. Cloud VPS
            if (categorySlug == "cloud-vps" || (string.IsNullOrEmpty(categorySlug) && planName.ToLower().Contains("vps")))
            {
                hasVps = true;
            }
            // 2. Game Server (Check before Dedicated to avoid Minecraft Dedicated Server confusion)
            else if (categorySlug == "game-server" || planName.ToLower().Contains("minecraft") || planName.ToLower().Contains("cs2") || planName.ToLower().Contains("rust"))
            {
                try
                {
                    var idempotencyKey = $"order-{order.Id}-{item.ServicePlanId}";
                    var existing = await _gameServerRepo.FirstOrDefaultAsync(g => g.IdempotencyKey == idempotencyKey, cancellationToken);
                    if (existing == null)
                    {
                        var serverName = !string.IsNullOrWhiteSpace(planName) ? planName : "Game Server";
                        var gameType = planName.ToLower().Contains("cs2") ? GameType.CS2 : (planName.ToLower().Contains("rust") ? GameType.Rust : GameType.Minecraft);
                        var newServer = new GameServerInstance
                        {
                            Id = Guid.NewGuid(),
                            UserId = order.UserId,
                            ServerName = serverName,
                            GameType = gameType,
                            IdempotencyKey = idempotencyKey,
                            Port = 25565,
                            ContainerId = $"gs-{Guid.NewGuid():N}",
                            Status = GameServerStatus.Running,
                            CreatedAt = DateTime.UtcNow,
                            ExpiresAt = DateTime.UtcNow.AddMonths(monthsToAdd)
                        };
                        await _gameServerRepo.AddAsync(newServer, cancellationToken);
                        await _uow.SaveChangesAsync(cancellationToken);

                        // Provision Docker container in background so payment response returns immediately
                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                using var scope = _scopeFactory.CreateScope();
                                var provisioningSvc = scope.ServiceProvider.GetRequiredService<IGameServerProvisioningService>();
                                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
                                await provisioningSvc.ProvisionGameServerAsync(newServer, cts.Token);
                                _logger.LogInformation("Auto-provisioned Game Server {Id} for order {OrderId}", newServer.Id, order.Id);
                            }
                            catch (Exception provEx)
                            {
                                _logger.LogWarning(provEx, "Lazy provisioning container for game server {Id}", newServer.Id);
                            }
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed auto-provisioning Game Server for order {OrderId}", order.Id);
                }
            }
            // 3. Dedicated Server
            else if (categorySlug == "dedicated-server" || planName.ToLower().Contains("máy chủ riêng") || (planName.ToLower().Contains("dedicated") && !planName.ToLower().Contains("minecraft") && !planName.ToLower().Contains("cs2")))
            {
                try
                {
                    var existing = await _dedicatedServerRepo.FirstOrDefaultAsync(d => d.UserId == order.UserId && d.ServerName == planName, cancellationToken);
                    if (existing == null)
                    {
                        var dedicated = new DedicatedServer
                        {
                            Id = Guid.NewGuid(),
                            UserId = order.UserId,
                            ServerName = !string.IsNullOrWhiteSpace(planName) ? planName : "Dell PowerEdge Dedicated Server",
                            CpuModel = "Intel Xeon Gold / AMD EPYC Dedicated",
                            RamGb = 128,
                            DiskBytes = 3840L * 1024 * 1024 * 1024,
                            OsImage = "Ubuntu 24.04 LTS",
                            Status = DedicatedServerStatus.Running,
                            RemoteAccessEnabled = true,
                            ProvisionedAt = DateTime.UtcNow,
                            ExpiresAt = DateTime.UtcNow.AddMonths(monthsToAdd)
                        };
                        await _dedicatedServerRepo.AddAsync(dedicated, cancellationToken);
                        await _uow.SaveChangesAsync(cancellationToken);
                        _logger.LogInformation("Auto-provisioned Dedicated Server {Id} for order {OrderId}", dedicated.Id, order.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed auto-provisioning Dedicated Server for order {OrderId}", order.Id);
                }
            }
            // 4. Managed Database
            else if (categorySlug == "managed-database" || planName.ToLower().Contains("database") || planName.ToLower().Contains("postgres") || planName.ToLower().Contains("mysql") || planName.ToLower().Contains("redis"))
            {
                try
                {
                    var engine = planName.ToLower().Contains("mysql") ? ManagedDatabaseEngine.MySQL : (planName.ToLower().Contains("redis") ? ManagedDatabaseEngine.Redis : ManagedDatabaseEngine.PostgreSQL);
                    var dbInstance = new ManagedDatabaseInstance
                    {
                        Id = Guid.NewGuid(),
                        UserId = order.UserId,
                        Name = $"db-{Guid.NewGuid():N}"[..12],
                        Engine = engine,
                        Version = engine == ManagedDatabaseEngine.PostgreSQL ? "16.1" : (engine == ManagedDatabaseEngine.MySQL ? "8.0" : "7.2"),
                        AdminUser = "cloudadmin",
                        AdminPassword = $"Pass@{Guid.NewGuid():N}"[..16],
                        IdempotencyKey = $"order-{order.Id}-{item.ServicePlanId}",
                        CreatedAt = DateTime.UtcNow
                    };
                    dbInstance.MarkAsProvisioning();
                    dbInstance.MarkAsRunning(engine == ManagedDatabaseEngine.PostgreSQL ? 5432 : (engine == ManagedDatabaseEngine.MySQL ? 3306 : 6379));
                    await _databaseRepo.AddAsync(dbInstance, cancellationToken);
                    await _uow.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Auto-provisioned Database {Id} for order {OrderId}", dbInstance.Id, order.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed auto-provisioning Database for order {OrderId}", order.Id);
                }
            }
            // 5. Web Hosting
            else if (categorySlug == "web-hosting" || planName.ToLower().Contains("hosting"))
            {
                try
                {
                    var hosting = new HostingAccount
                    {
                        Id = Guid.NewGuid(),
                        UserId = order.UserId,
                        PlanId = item.ServicePlanId,
                        ContainerId = $"host-{Guid.NewGuid():N}"[..12],
                        ControlPanelUrl = "https://cpanel.cloudhost.vn:2083",
                        DiskUsedGb = 0,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddMonths(monthsToAdd)
                    };
                    await _hostingRepo.AddAsync(hosting, cancellationToken);
                    await _uow.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Auto-provisioned Web Hosting {Id} for order {OrderId}", hosting.Id, order.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed auto-provisioning Web Hosting for order {OrderId}", order.Id);
                }
            }
            // 6. Object Storage S3
            else if (categorySlug == "object-storage" || planName.ToLower().Contains("storage") || planName.ToLower().Contains("s3"))
            {
                try
                {
                    var bucket = new ObjectStorageBucket
                    {
                        Id = Guid.NewGuid(),
                        UserId = order.UserId,
                        BucketName = $"bucket-{Guid.NewGuid():N}"[..14],
                        Region = "ap-southeast-1 (Hanoi)",
                        CapacityGB = 100,
                        IdempotencyKey = $"order-{order.Id}-{item.ServicePlanId}",
                        CreatedAt = DateTime.UtcNow
                    };
                    bucket.MarkAsProvisioning();
                    bucket.MarkAsActive();
                    await _storageRepo.AddAsync(bucket, cancellationToken);
                    await _uow.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Auto-provisioned Storage Bucket {Id} for order {OrderId}", bucket.Id, order.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed auto-provisioning Storage Bucket for order {OrderId}", order.Id);
                }
            }
        }

        if (hasVps)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var scopedMediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
                    await scopedMediator.Send(new ProvisionVpsCommand { OrderId = order.Id }, cts.Token);
                    _logger.LogInformation("Auto-provisioned VPS for order {OrderId}", order.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to auto-provision VPS for order {OrderId}", order.Id);
                }
            });
        }
    }
}
