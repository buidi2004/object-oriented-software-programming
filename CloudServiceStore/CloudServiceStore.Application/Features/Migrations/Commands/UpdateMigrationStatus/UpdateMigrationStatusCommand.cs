using System;
using CloudServiceStore.Domain.Enums;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Commands.UpdateMigrationStatus;

public record UpdateMigrationStatusCommand(Guid Id, MigrationStatus Status) : IRequest<bool>;
