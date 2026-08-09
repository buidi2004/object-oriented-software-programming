using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Commands.CreateMigration;

public record CreateMigrationCommand(Guid OrderId, string FromProvider, string Note) : IRequest<Guid>;
