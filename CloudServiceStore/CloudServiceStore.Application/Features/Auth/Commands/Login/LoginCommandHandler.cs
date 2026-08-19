using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Security;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;

namespace CloudServiceStore.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResult>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<UserSession> _sessionRepo;
    private readonly IRepository<LoginHistory> _historyRepo;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenGenerator _tokenGenerator;

    public LoginCommandHandler(
        IUnitOfWork uow,
        IRepository<AppUser> userRepo,
        IRepository<UserSession> sessionRepo,
        IRepository<LoginHistory> historyRepo,
        IPasswordHasher hasher,
        ITokenGenerator tokenGenerator)
    {
        _uow = uow;
        _userRepo = userRepo;
        _sessionRepo = sessionRepo;
        _historyRepo = historyRepo;
        _hasher = hasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _userRepo.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        
        if (user == null || !_hasher.Verify(request.Password, user.PasswordHash))
        {
            if (user != null)
            {
                await LogHistoryAsync(user.Id, request, false, ct);
                await _uow.SaveChangesAsync(ct);
            }
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
        }

        if (!user.IsActive)
        {
            await LogHistoryAsync(user.Id, request, false, ct);
            await _uow.SaveChangesAsync(ct);
            throw new UnauthorizedException("Tài khoản đã bị khóa hoặc chưa kích hoạt.");
        }

        var role = await _uow.Roles.GetByIdAsync(user.RoleId, ct);
        string roleName = role?.Name ?? "Customer";

        // Check 2FA
        if (user.IsTwoFactorEnabled)
        {
            await LogHistoryAsync(user.Id, request, true, ct);
            await _uow.SaveChangesAsync(ct);
            return new LoginResult(string.Empty, string.Empty, true, user.Email);
        }

        var accessToken = _tokenGenerator.GenerateAccessToken(user, roleName);
        var refreshToken = _tokenGenerator.GenerateRefreshToken();

        // Save session
        var session = new UserSession
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RefreshTokenHash = RefreshTokenHasher.Hash(refreshToken),
            DeviceInfo = request.DeviceInfo,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // 7 days refresh token validity
            IsRevoked = false
        };
        await _sessionRepo.AddAsync(session, ct);

        // Save history
        await LogHistoryAsync(user.Id, request, true, ct);

        await _uow.SaveChangesAsync(ct);

        return new LoginResult(accessToken, refreshToken);
    }

    private Task LogHistoryAsync(Guid userId, LoginCommand request, bool isSuccess, CancellationToken ct)
    {
        var history = new LoginHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            LoginAt = DateTime.UtcNow,
            IpAddress = request.IpAddress,
            UserAgent = request.UserAgent,
            IsSuccess = isSuccess
        };
        return _historyRepo.AddAsync(history, ct);
    }
}
