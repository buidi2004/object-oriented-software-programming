using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GameServers.Queries.GetGameServerLogs;

public record GetGameServerLogsQuery(Guid Id, int TailCount = 100) : IRequest<IEnumerable<string>>;

public class GetGameServerLogsQueryHandler : IRequestHandler<GetGameServerLogsQuery, IEnumerable<string>>
{
    private readonly IRepository<GameServerInstance> _repository;
    private readonly IGameServerProvisioningService _provisioningService;

    public GetGameServerLogsQueryHandler(
        IRepository<GameServerInstance> repository,
        IGameServerProvisioningService provisioningService)
    {
        _repository = repository;
        _provisioningService = provisioningService;
    }

    public async Task<IEnumerable<string>> Handle(GetGameServerLogsQuery request, CancellationToken cancellationToken)
    {
        var gameServer = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (gameServer == null)
            throw new NotFoundException(nameof(GameServerInstance), request.Id);

        var containerId = string.IsNullOrEmpty(gameServer.ContainerId) ? $"gs-{gameServer.Id:N}" : gameServer.ContainerId;

        return await _provisioningService.GetLogsAsync(containerId, request.TailCount, cancellationToken);
    }
}
