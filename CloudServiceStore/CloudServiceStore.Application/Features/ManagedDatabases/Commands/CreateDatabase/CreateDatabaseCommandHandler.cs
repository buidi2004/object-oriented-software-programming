using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ManagedDatabases.Commands.CreateDatabase;

public class CreateDatabaseCommandHandler : IRequestHandler<CreateDatabaseCommand, Guid>
{
    private readonly IRepository<ManagedDatabaseInstance> _dbRepo;
    private readonly IDatabaseProvisioningService _dbProvisioningService;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public CreateDatabaseCommandHandler(
        IRepository<ManagedDatabaseInstance> dbRepo,
        IDatabaseProvisioningService dbProvisioningService,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _dbRepo = dbRepo;
        _dbProvisioningService = dbProvisioningService;
        _uow = uow;
        _currentUser = currentUser;
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

        // Gọi Docker Provisioning Service (Mock)
        int assignedPort = await _dbProvisioningService.ProvisionDatabaseAsync(instance, cancellationToken);

        if (assignedPort > 0)
        {
            instance.MarkAsRunning(assignedPort);
        }
        else
        {
            instance.MarkAsFailed("Lỗi khi cấp phát Database qua Docker.");
        }

        await _uow.SaveChangesAsync(cancellationToken);

        return instance.Id;
    }
}
