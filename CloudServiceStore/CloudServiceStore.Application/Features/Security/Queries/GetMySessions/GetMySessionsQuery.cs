using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Security.Queries.GetMySessions;

public record SessionDto(Guid Id, string DeviceInfo, DateTime ExpiresAt, bool IsRevoked);

public record GetMySessionsQuery() : IRequest<IReadOnlyList<SessionDto>>;
