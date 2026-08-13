using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Commands.AssignPermissions;

public class AssignPermissionsToRoleCommandHandler : IRequestHandler<AssignPermissionsToRoleCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<RolePermission> _rolePermRepo;

    public AssignPermissionsToRoleCommandHandler(IUnitOfWork uow, IRepository<RolePermission> rolePermRepo)
    {
        _uow = uow;
        _rolePermRepo = rolePermRepo;
    }

    public async Task Handle(AssignPermissionsToRoleCommand request, CancellationToken ct)
    {
        var existingPerms = await _rolePermRepo.WhereAsync(rp => rp.RoleId == request.RoleId, ct);
        foreach (var p in existingPerms)
        {
            _rolePermRepo.Delete(p);
        }

        foreach (var permId in request.PermissionIds)
        {
            await _rolePermRepo.AddAsync(new RolePermission
            {
                Id = Guid.NewGuid(),
                RoleId = request.RoleId,
                PermissionId = permId
            }, ct);
        }

        await _uow.SaveChangesAsync(ct);
    }
}
