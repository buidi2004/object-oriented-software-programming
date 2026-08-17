using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;

public record CreateGameServerCommand(GameType GameType) : IRequest<Guid>;

public class CreateGameServerCommandHandler : IRequestHandler<CreateGameServerCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<GameServerInstance> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateGameServerCommandHandler(
        IUnitOfWork uow,
        IRepository<GameServerInstance> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateGameServerCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var server = new GameServerInstance
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            GameType = request.GameType,
            Status = GameServerStatus.Creating
        };

        await _repo.AddAsync(server, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return server.Id;
    }
}
