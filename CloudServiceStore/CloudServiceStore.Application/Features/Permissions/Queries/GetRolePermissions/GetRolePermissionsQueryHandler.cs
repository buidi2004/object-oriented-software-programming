using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Queries.GetRolePermissions;

public class GetRolePermissionsQueryHandler : IRequestHandler<GetRolePermissionsQuery, IReadOnlyList<PermissionDto>>
{
    private readonly IRepository<RolePermission> _rolePermRepo;
    private readonly IRepository<Permission> _permissionRepo;

    public GetRolePermissionsQueryHandler(IRepository<RolePermission> rolePermRepo, IRepository<Permission> permissionRepo)
    {
        _rolePermRepo = rolePermRepo;
        _permissionRepo = permissionRepo;
    }

    public async Task<IReadOnlyList<PermissionDto>> Handle(GetRolePermissionsQuery request, CancellationToken ct)
    {
        var rolePerms = await _rolePermRepo.WhereAsync(rp => rp.RoleId == request.RoleId, ct);
        var allPerms = await _permissionRepo.GetAllAsync(ct);
        var permDict = allPerms.ToDictionary(p => p.Id, p => p);
        
        return rolePerms
            .Where(rp => permDict.ContainsKey(rp.PermissionId))
            .Select(rp => {
                var p = permDict[rp.PermissionId];
                return new PermissionDto(p.Id, p.Code, p.Name);
            })
            .ToList().AsReadOnly();
    }
}
