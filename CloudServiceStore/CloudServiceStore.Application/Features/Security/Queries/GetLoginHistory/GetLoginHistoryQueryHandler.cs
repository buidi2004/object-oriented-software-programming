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

namespace CloudServiceStore.Application.Features.Security.Queries.GetLoginHistory;

public class GetLoginHistoryQueryHandler : IRequestHandler<GetLoginHistoryQuery, IReadOnlyList<LoginHistoryDto>>
{
    private readonly IRepository<LoginHistory> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetLoginHistoryQueryHandler(IRepository<LoginHistory> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<LoginHistoryDto>> Handle(GetLoginHistoryQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var histories = await _repo.WhereAsync(h => h.UserId == userId, ct);

        return histories.Select(h => new LoginHistoryDto(
            h.Id, h.IpAddress, h.UserAgent, h.IsSuccess, h.LoginAt
        )).ToList().AsReadOnly();
    }
}
