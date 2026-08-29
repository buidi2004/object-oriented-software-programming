using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GameServers.Queries.GetGameServerStats;

public record GetGameServerStatsQuery(Guid Id) : IRequest<GameServerStatsDto>;

public class GetGameServerStatsQueryHandler : IRequestHandler<GetGameServerStatsQuery, GameServerStatsDto>
{
    private readonly IRepository<GameServerInstance> _repository;
    private readonly IGameServerProvisioningService _provisioningService;

    public GetGameServerStatsQueryHandler(
        IRepository<GameServerInstance> repository,
        IGameServerProvisioningService provisioningService)
    {
        _repository = repository;
        _provisioningService = provisioningService;
    }

    public async Task<GameServerStatsDto> Handle(GetGameServerStatsQuery request, CancellationToken cancellationToken)
    {
        var gameServer = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (gameServer == null)
            throw new NotFoundException(nameof(GameServerInstance), request.Id);

        var containerId = string.IsNullOrEmpty(gameServer.ContainerId) ? $"gs-{gameServer.Id:N}" : gameServer.ContainerId;

        return await _provisioningService.GetStatsAsync(containerId, cancellationToken);
    }
}
