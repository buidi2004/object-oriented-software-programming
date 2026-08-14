using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Roles.Queries.GetAllRoles;

public record RoleDto(Guid Id, string Name);

public record GetAllRolesQuery() : IRequest<IReadOnlyList<RoleDto>>;
