using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Roles.Commands.CreateRole;

public record CreateRoleCommand(string Name) : IRequest<Guid>;
