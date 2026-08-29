using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.GameServers.Commands.RestartGameServer;

public record RestartGameServerCommand(Guid Id) : IRequest<bool>;

public class RestartGameServerCommandHandler : IRequestHandler<RestartGameServerCommand, bool>
{
    private readonly IRepository<GameServerInstance> _repo;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public RestartGameServerCommandHandler(
        IRepository<GameServerInstance> repo,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _repo = repo;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<bool> Handle(RestartGameServerCommand request, CancellationToken cancellationToken)
    {
        var server = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (server == null) throw new NotFoundException("Game Server không tồn tại.");

        var userId = _currentUser.UserId;
        if (server.UserId != userId && !_currentUser.IsInRole("Admin"))
        {
            throw new UnauthorizedException("Bạn không có quyền khởi động lại Game Server này.");
        }

        var containerId = server.ContainerId;
        if (string.IsNullOrEmpty(containerId))
        {
            throw new BadRequestException("Game Server này chưa được cấp phát container.");
        }

        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedProvService = serviceProvider.GetRequiredService<IGameServerProvisioningService>();
            await scopedProvService.RestartGameServerAsync(containerId, ct);
        });

        return true;
    }
}
