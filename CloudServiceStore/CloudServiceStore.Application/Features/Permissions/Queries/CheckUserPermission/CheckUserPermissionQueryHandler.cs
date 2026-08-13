using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Queries.CheckUserPermission;

public class CheckUserPermissionQueryHandler : IRequestHandler<CheckUserPermissionQuery, bool>
{
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<RolePermission> _rolePermRepo;

    public CheckUserPermissionQueryHandler(IRepository<AppUser> userRepo, IRepository<RolePermission> rolePermRepo)
    {
        _userRepo = userRepo;
        _rolePermRepo = rolePermRepo;
    }

    public async Task<bool> Handle(CheckUserPermissionQuery request, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId, ct);
        if (user == null) return false;

        var rolePerms = await _rolePermRepo.WhereAsync(rp => rp.RoleId == user.RoleId, ct);
        
        return rolePerms.Any(rp => rp.Permission.Code == request.PermissionCode);
    }
}
