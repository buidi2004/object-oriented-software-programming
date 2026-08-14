using System.Collections.Generic;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Queries.GetAllMigrations;

public record GetAllMigrationsQuery() : IRequest<IEnumerable<MigrationRequest>>;
