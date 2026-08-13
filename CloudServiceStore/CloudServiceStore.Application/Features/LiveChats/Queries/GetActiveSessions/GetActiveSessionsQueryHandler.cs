using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Queries.GetActiveSessions;

public class GetActiveSessionsQueryHandler : IRequestHandler<GetActiveSessionsQuery, IReadOnlyList<ActiveSessionDto>>
{
    private readonly IRepository<ChatSession> _sessionRepo;
    private readonly IRepository<AppUser> _userRepo;

    public GetActiveSessionsQueryHandler(IRepository<ChatSession> sessionRepo, IRepository<AppUser> userRepo)
    {
        _sessionRepo = sessionRepo;
        _userRepo = userRepo;
    }

    public async Task<IReadOnlyList<ActiveSessionDto>> Handle(GetActiveSessionsQuery request, CancellationToken ct)
    {
        var sessions = await _sessionRepo.WhereAsync(s => s.Status == "Open", ct);
        var users = await _userRepo.GetAllAsync(ct);
        var userDict = users.ToDictionary(u => u.Id, u => u);

        return sessions
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => 
            {
                var user = userDict.GetValueOrDefault(s.UserId);
                return new ActiveSessionDto(s.Id, s.UserId, user?.Email, user?.FullName, s.CreatedAt);
            })
            .ToList().AsReadOnly();
    }
}
