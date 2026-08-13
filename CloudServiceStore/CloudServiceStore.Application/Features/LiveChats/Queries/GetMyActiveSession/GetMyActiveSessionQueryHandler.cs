using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Queries.GetMyActiveSession;

public class GetMyActiveSessionQueryHandler : IRequestHandler<GetMyActiveSessionQuery, Guid?>
{
    private readonly IRepository<ChatSession> _sessionRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyActiveSessionQueryHandler(IRepository<ChatSession> sessionRepo, ICurrentUserService currentUser)
    {
        _sessionRepo = sessionRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid?> Handle(GetMyActiveSessionQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");

        var sessions = await _sessionRepo.WhereAsync(s => s.UserId == userId && s.Status == "Open", ct);
        var activeSession = sessions.OrderByDescending(s => s.CreatedAt).FirstOrDefault();

        return activeSession?.Id;
    }
}
