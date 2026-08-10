using MediatR;
using System;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.Permissions.Commands.UpdateRolePermissions;

public class UpdateRolePermissionsCommand : IRequest<bool>
{
    public Guid RoleId { get; set; }
    public List<Guid> PermissionIds { get; set; } = new();
}
