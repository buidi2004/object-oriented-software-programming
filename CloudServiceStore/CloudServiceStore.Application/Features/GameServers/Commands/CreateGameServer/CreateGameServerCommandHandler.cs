using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

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
    private readonly IGameServerProvisioningService _provisioningService;

    public CreateGameServerCommandHandler(
        IUnitOfWork uow,
        IRepository<GameServerInstance> repo,
        ICurrentUserService currentUser,
        IGameServerProvisioningService provisioningService)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
        _provisioningService = provisioningService;
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

        // Provisioning
        int assignedPort = await _provisioningService.ProvisionGameServerAsync(server, cancellationToken);
        
        if (assignedPort > 0)
        {
            server.MarkAsRunning(assignedPort);
        }
        else
        {
            server.MarkAsFailed("Lỗi tạo container cho Game Server.");
        }

        await _uow.SaveChangesAsync(cancellationToken);

        return server.Id;
    }
}
