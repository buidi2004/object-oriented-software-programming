using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Permissions.Queries.CheckUserPermission;

public record CheckUserPermissionQuery(Guid UserId, string PermissionCode) : IRequest<bool>;
