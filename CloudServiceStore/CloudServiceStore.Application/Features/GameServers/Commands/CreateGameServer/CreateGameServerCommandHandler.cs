using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;

public record CreateGameServerCommand(
    string ServerName,
    GameType GameType,
    string IdempotencyKey) : IRequest<Guid>;

public class CreateGameServerCommandHandler : IRequestHandler<CreateGameServerCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<GameServerInstance> _repo;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public CreateGameServerCommandHandler(
        IUnitOfWork uow,
        IRepository<GameServerInstance> repo,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(CreateGameServerCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // Idempotency Check
        var existing = await _repo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        var server = new GameServerInstance
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ServerName = request.ServerName,
            GameType = request.GameType,
            IdempotencyKey = request.IdempotencyKey
        };

        server.MarkAsProvisioning();

        await _repo.AddAsync(server, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var serverId = server.Id;

        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedRepo = serviceProvider.GetRequiredService<IRepository<GameServerInstance>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IGameServerProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbServer = await scopedRepo.GetByIdAsync(serverId, ct);
            if (dbServer == null) return;

            try
            {
                int assignedPort = await scopedProvService.ProvisionGameServerAsync(dbServer, ct);

                if (assignedPort > 0)
                {
                    dbServer.MarkAsRunning(assignedPort);
                }
                else
                {
                    dbServer.MarkAsFailed("Lỗi tạo container cho Game Server.");
                }
            }
            catch (Exception ex)
            {
                dbServer.MarkAsFailed($"Lỗi cấp phát: {ex.Message}");
            }

            await scopedUow.SaveChangesAsync(ct);

            await scopedNotifier.NotifyStatusChangedAsync("GameServerInstance", dbServer.Id.ToString(), dbServer.Status.ToString());
        });

        return serverId;
    }
}
