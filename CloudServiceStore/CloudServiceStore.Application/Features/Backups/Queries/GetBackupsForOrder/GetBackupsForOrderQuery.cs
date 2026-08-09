using System;
using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Backups.Queries.GetBackupsForOrder;
public record GetBackupsForOrderQuery(Guid OrderId) : IRequest<IEnumerable<BackupJob>>;
