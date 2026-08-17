using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.DedicatedServers.Commands.CreateDedicatedServer;

public class CreateDedicatedServerCommandHandler : IRequestHandler<CreateDedicatedServerCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<DedicatedServer> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateDedicatedServerCommandHandler(
        IUnitOfWork uow,
        IRepository<DedicatedServer> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateDedicatedServerCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var server = new DedicatedServer
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ServerName = request.ServerName,
            CpuModel = request.CpuModel,
            RamGb = request.RamGb,
            DiskBytes = request.DiskBytes,
            OsImage = request.OsImage,
            Status = DedicatedServerStatus.Provisioning,
            RemoteAccessEnabled = true,
            ProvisionedAt = DateTime.UtcNow,
            ExpiresAt = request.ExpiresAt
        };

        await _repo.AddAsync(server, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        // Mock: change status to Running after provisioning
        server.Status = DedicatedServerStatus.Running;
        _repo.Update(server);
        await _uow.SaveChangesAsync(cancellationToken);

        return server.Id;
    }
}
