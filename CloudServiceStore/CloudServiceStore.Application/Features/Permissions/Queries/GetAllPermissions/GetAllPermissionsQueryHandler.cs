using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Permissions.Queries.GetRolePermissions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions;

public class GetAllPermissionsQueryHandler : IRequestHandler<GetAllPermissionsQuery, IReadOnlyList<PermissionDto>>
{
    private readonly IRepository<Permission> _permissionRepo;

    public GetAllPermissionsQueryHandler(IRepository<Permission> permissionRepo)
    {
        _permissionRepo = permissionRepo;
    }

    public async Task<IReadOnlyList<PermissionDto>> Handle(GetAllPermissionsQuery request, CancellationToken ct)
    {
        var permissions = await _permissionRepo.GetAllAsync(ct);
        return permissions.Select(p => new PermissionDto(p.Id, p.Code, p.Name)).ToList().AsReadOnly();
    }
}
