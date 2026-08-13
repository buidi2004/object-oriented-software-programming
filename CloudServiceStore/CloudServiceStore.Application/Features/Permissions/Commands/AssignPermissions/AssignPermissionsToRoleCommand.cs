using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Commands.AssignPermissions;

public record AssignPermissionsToRoleCommand(Guid RoleId, List<Guid> PermissionIds) : IRequest;
