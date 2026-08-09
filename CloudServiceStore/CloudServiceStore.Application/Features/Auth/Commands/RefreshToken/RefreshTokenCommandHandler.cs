using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Security; // For RefreshTokenHasher

namespace CloudServiceStore.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResult>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<UserSession> _sessionRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ITokenGenerator _tokenGenerator;

    public RefreshTokenCommandHandler(
        IUnitOfWork uow, IRepository<UserSession> sessionRepo,
        IRepository<AppUser> userRepo, ITokenGenerator tokenGenerator)
    {
        _uow = uow; _sessionRepo = sessionRepo; _userRepo = userRepo; _tokenGenerator = tokenGenerator;
    }

    public async Task<RefreshTokenResult> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var tokenHash = RefreshTokenHasher.Hash(request.RefreshToken);
        var session = await _sessionRepo.FirstOrDefaultAsync(s => s.RefreshTokenHash == tokenHash, ct);

        if (session is null)
            throw new UnauthorizedException("Refresh token không hợp lệ.");

        if (session.IsRevoked)
        {
            var activeSessions = await _sessionRepo.WhereAsync(
                s => s.UserId == session.UserId && !s.IsRevoked, ct);
            foreach (var s in activeSessions) s.IsRevoked = true;
            await _uow.SaveChangesAsync(ct);

            throw new UnauthorizedException(
                "Phát hiện dấu hiệu token bị đánh cắp. Toàn bộ phiên đăng nhập đã bị thu hồi.");
        }

        if (session.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token đã hết hạn.");

        var user = await _userRepo.GetByIdAsync(session.UserId, ct)
            ?? throw new UnauthorizedException("Người dùng không tồn tại.");

        session.IsRevoked = true;

        var role = await _uow.Roles.GetByIdAsync(user.RoleId, ct);
        string roleName = role?.Name ?? "Customer";

        var newAccessToken = _tokenGenerator.GenerateAccessToken(user, roleName);
        var newRefreshToken = _tokenGenerator.GenerateRefreshToken();

        await _sessionRepo.AddAsync(new UserSession
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RefreshTokenHash = RefreshTokenHasher.Hash(newRefreshToken),
            DeviceInfo = session.DeviceInfo,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        }, ct);

        await _uow.SaveChangesAsync(ct);
        return new RefreshTokenResult(newAccessToken, newRefreshToken);
    }
}
