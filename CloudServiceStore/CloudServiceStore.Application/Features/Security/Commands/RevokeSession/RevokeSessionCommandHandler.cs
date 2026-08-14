using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Security.Commands.RevokeSession;

public class RevokeSessionCommandHandler : IRequestHandler<RevokeSessionCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<UserSession> _sessionRepo;
    private readonly ICurrentUserService _currentUser;

    public RevokeSessionCommandHandler(
        IUnitOfWork uow,
        IRepository<UserSession> sessionRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _sessionRepo = sessionRepo;
        _currentUser = currentUser;
    }

    public async Task Handle(RevokeSessionCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct)
            ?? throw new NotFoundException($"Session {request.SessionId} không tồn tại.");

        if (session.UserId != userId)
            throw new UnauthorizedException("Không có quyền thu hồi session của người khác.");

        session.IsRevoked = true;
        _sessionRepo.Update(session);
        await _uow.SaveChangesAsync(ct);
    }
}
