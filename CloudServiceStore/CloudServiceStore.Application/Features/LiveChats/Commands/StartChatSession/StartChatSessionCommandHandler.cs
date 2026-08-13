using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Commands.StartChatSession;

public class StartChatSessionCommandHandler : IRequestHandler<StartChatSessionCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ChatSession> _sessionRepo;
    private readonly ICurrentUserService _currentUser;

    public StartChatSessionCommandHandler(IUnitOfWork uow, IRepository<ChatSession> sessionRepo, ICurrentUserService currentUser)
    {
        _uow = uow;
        _sessionRepo = sessionRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(StartChatSessionCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");

        var session = new ChatSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        };

        await _sessionRepo.AddAsync(session, ct);
        await _uow.SaveChangesAsync(ct);

        return session.Id;
    }
}
