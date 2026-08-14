using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Queries.GetActiveSessions;

public record ActiveSessionDto(Guid Id, Guid UserId, string? UserEmail, string? UserFullName, DateTime CreatedAt);

public record GetActiveSessionsQuery : IRequest<IReadOnlyList<ActiveSessionDto>>;
