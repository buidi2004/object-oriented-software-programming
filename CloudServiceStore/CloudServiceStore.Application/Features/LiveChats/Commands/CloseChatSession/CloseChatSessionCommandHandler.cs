using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Commands.CloseChatSession;

public class CloseChatSessionCommandHandler : IRequestHandler<CloseChatSessionCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ChatSession> _sessionRepo;
    private readonly ICurrentUserService _currentUser;

    public CloseChatSessionCommandHandler(IUnitOfWork uow, IRepository<ChatSession> sessionRepo, ICurrentUserService currentUser)
    {
        _uow = uow;
        _sessionRepo = sessionRepo;
        _currentUser = currentUser;
    }

    public async Task Handle(CloseChatSessionCommand request, CancellationToken ct)
    {
        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct)
            ?? throw new NotFoundException("Chat session not found");

        var isOwner = session.UserId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInRole("Admin");
        if (!isOwner && !isAdmin)
            throw new UnauthorizedException("Not authorized to close this session.");

        session.Status = "Closed";
        _sessionRepo.Update(session);
        await _uow.SaveChangesAsync(ct);
    }
}
