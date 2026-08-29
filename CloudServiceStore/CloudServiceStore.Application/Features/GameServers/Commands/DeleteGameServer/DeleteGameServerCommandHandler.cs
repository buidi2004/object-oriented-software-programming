using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.GameServers.Commands.DeleteGameServer;

public record DeleteGameServerCommand(Guid Id) : IRequest<bool>;

public class DeleteGameServerCommandHandler : IRequestHandler<DeleteGameServerCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<GameServerInstance> _repo;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public DeleteGameServerCommandHandler(
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

    public async Task<bool> Handle(DeleteGameServerCommand request, CancellationToken cancellationToken)
    {
        var server = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (server == null) throw new NotFoundException("Game Server không tồn tại.");

        var userId = _currentUser.UserId;
        if (server.UserId != userId && !_currentUser.IsInRole("Admin"))
        {
            throw new UnauthorizedException("Bạn không có quyền xóa Game Server này.");
        }

        var containerId = server.ContainerId;
        _repo.Delete(server);
        await _uow.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrEmpty(containerId))
        {
            await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
            {
                var scopedProvService = serviceProvider.GetRequiredService<IGameServerProvisioningService>();
                await scopedProvService.DeleteGameServerAsync(containerId, ct);
            });
        }

        return true;
    }
}
