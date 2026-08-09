using System;
using System.Collections.Generic;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Queries.GetMyMigrations;

public record GetMyMigrationsQuery : IRequest<IEnumerable<MigrationRequest>>;
