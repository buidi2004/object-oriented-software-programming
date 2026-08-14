using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Queries.GetRolePermissions;

public record PermissionDto(Guid Id, string Code, string Name);

public record GetRolePermissionsQuery(Guid RoleId) : IRequest<IReadOnlyList<PermissionDto>>;
