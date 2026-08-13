using System.Collections.Generic;
using CloudServiceStore.Application.Features.Permissions.Queries.GetRolePermissions;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions;

public record GetAllPermissionsQuery() : IRequest<IReadOnlyList<PermissionDto>>;
