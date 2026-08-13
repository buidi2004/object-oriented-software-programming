using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Commands.ChangeRole;

public record ChangeUserRoleCommand(Guid UserId, string RoleName) : IRequest;
