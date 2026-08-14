using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Security.Queries.GetMySessions;

public class GetMySessionsQueryHandler : IRequestHandler<GetMySessionsQuery, IReadOnlyList<SessionDto>>
{
    private readonly IRepository<UserSession> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMySessionsQueryHandler(IRepository<UserSession> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<SessionDto>> Handle(GetMySessionsQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var sessions = await _repo.WhereAsync(s => s.UserId == userId, ct);

        return sessions.Select(s => new SessionDto(
            s.Id, s.DeviceInfo, s.ExpiresAt, s.IsRevoked
        )).ToList().AsReadOnly();
    }
}
