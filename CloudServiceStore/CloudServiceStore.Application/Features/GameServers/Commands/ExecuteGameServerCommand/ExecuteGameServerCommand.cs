using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GameServers.Commands.ExecuteGameServerCommand;

public record ExecuteGameServerCommand(Guid Id, string Command) : IRequest<string>;

public class ExecuteGameServerCommandHandler : IRequestHandler<ExecuteGameServerCommand, string>
{
    private readonly IRepository<GameServerInstance> _repository;
    private readonly IUnitOfWork _uow;
    private readonly IGameServerProvisioningService _provisioningService;

    public ExecuteGameServerCommandHandler(
        IRepository<GameServerInstance> repository,
        IUnitOfWork uow,
        IGameServerProvisioningService provisioningService)
    {
        _repository = repository;
        _uow = uow;
        _provisioningService = provisioningService;
    }

    public async Task<string> Handle(ExecuteGameServerCommand request, CancellationToken cancellationToken)
    {
        var server = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (server == null)
            throw new NotFoundException(nameof(GameServerInstance), request.Id);

        var containerId = string.IsNullOrEmpty(server.ContainerId) ? $"gs-{server.Id:N}" : server.ContainerId;
        if (string.IsNullOrEmpty(server.ContainerId))
        {
            server.ContainerId = containerId;
            _repository.Update(server);
            await _uow.SaveChangesAsync(cancellationToken);
        }

        return await _provisioningService.ExecuteCommandAsync(containerId, request.Command, cancellationToken);
    }
}
