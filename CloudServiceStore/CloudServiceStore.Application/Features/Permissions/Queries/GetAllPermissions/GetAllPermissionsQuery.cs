using MediatR;
using System;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions;

public class GetAllPermissionsQuery : IRequest<IEnumerable<PermissionDto>>
{
}

public class PermissionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
}
