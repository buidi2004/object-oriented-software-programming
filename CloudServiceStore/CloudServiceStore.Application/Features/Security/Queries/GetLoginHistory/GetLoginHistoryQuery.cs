using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Security.Queries.GetLoginHistory;

public record LoginHistoryDto(Guid Id, string IpAddress, string UserAgent, bool IsSuccess, DateTime LoginAt);

public record GetLoginHistoryQuery() : IRequest<IReadOnlyList<LoginHistoryDto>>;
