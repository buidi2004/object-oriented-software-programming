using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
public record ScheduleBackupCommand(Guid OrderId, DateTime ScheduledAt) : IRequest<Guid>;
