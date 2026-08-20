using System;
using CloudServiceStore.Domain.Enums;
using MediatR;

namespace CloudServiceStore.Application.Features.ManagedDatabases.Commands.CreateDatabase;

public record CreateDatabaseCommand(
    string Name,
    ManagedDatabaseEngine Engine,
    string Version,
    string AdminUser,
    string AdminPassword,
    string IdempotencyKey) : IRequest<Guid>;
