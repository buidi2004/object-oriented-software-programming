using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.AuditLogs.Queries.GetAuditLogs;

public record AuditLogDto(Guid Id, Guid? UserId, string? UserEmail, string Action, string EntityName, string EntityId, string IpAddress, DateTime Timestamp);

public record GetAuditLogsQuery() : IRequest<IReadOnlyList<AuditLogDto>>;
