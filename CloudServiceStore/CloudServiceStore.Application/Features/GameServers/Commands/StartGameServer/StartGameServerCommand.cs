using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GameServers.Commands.StartGameServer;

public record StartGameServerCommand(Guid Id) : IRequest;

public class StartGameServerCommandHandler : IRequestHandler<StartGameServerCommand>
{
    private readonly IRepository<GameServerInstance> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGameServerProvisioningService _provisioningService;

    public StartGameServerCommandHandler(
        IRepository<GameServerInstance> repository,
        IUnitOfWork unitOfWork,
        IGameServerProvisioningService provisioningService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _provisioningService = provisioningService;
    }

    public async Task Handle(StartGameServerCommand request, CancellationToken cancellationToken)
    {
        var server = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (server == null)
            throw new NotFoundException(nameof(GameServerInstance), request.Id);

        if (!string.IsNullOrEmpty(server.ContainerId))
        {
            await _provisioningService.StartGameServerAsync(server.ContainerId, cancellationToken);
            server.Status = GameServerStatus.Running;
            _repository.Update(server);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
