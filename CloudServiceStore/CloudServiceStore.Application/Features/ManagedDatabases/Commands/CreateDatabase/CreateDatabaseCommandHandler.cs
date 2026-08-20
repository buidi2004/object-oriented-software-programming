using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.ManagedDatabases.Commands.CreateDatabase;

public class CreateDatabaseCommandHandler : IRequestHandler<CreateDatabaseCommand, Guid>
{
    private readonly IRepository<ManagedDatabaseInstance> _dbRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public CreateDatabaseCommandHandler(
        IRepository<ManagedDatabaseInstance> dbRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _dbRepo = dbRepo;
        _uow = uow;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(CreateDatabaseCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // Idempotency Check
        var existing = await _dbRepo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        var instance = new ManagedDatabaseInstance
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Engine = request.Engine,
            Version = request.Version,
            AdminUser = request.AdminUser,
            AdminPassword = request.AdminPassword, // MVP: lưu plain text
            IdempotencyKey = request.IdempotencyKey
        };

        instance.MarkAsProvisioning();

        await _dbRepo.AddAsync(instance, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var instanceId = instance.Id;

        // Enqueue Provisioning Task
        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedRepo = serviceProvider.GetRequiredService<IRepository<ManagedDatabaseInstance>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IDatabaseProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbInstance = await scopedRepo.GetByIdAsync(instanceId, ct);
            if (dbInstance == null) return;

            try
            {
                int assignedPort = await scopedProvService.ProvisionDatabaseAsync(dbInstance, ct);

                if (assignedPort > 0)
                {
                    dbInstance.MarkAsRunning(assignedPort);
                }
                else
                {
                    dbInstance.MarkAsFailed("Lỗi khi cấp phát Database qua Docker.");
                }
            }
            catch (Exception ex)
            {
                dbInstance.MarkAsFailed($"Lỗi cấp phát: {ex.Message}");
            }

            await scopedUow.SaveChangesAsync(ct);

            // Notify Frontend via SignalR
            await scopedNotifier.NotifyStatusChangedAsync("ManagedDatabaseInstance", dbInstance.Id.ToString(), dbInstance.Status.ToString());
        });

        return instanceId;
    }
}
