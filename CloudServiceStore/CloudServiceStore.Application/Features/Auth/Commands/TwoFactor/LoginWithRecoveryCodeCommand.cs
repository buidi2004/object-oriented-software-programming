using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using CloudServiceStore.Application.Security;

namespace CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;

public record LoginWithRecoveryCodeCommand(string Email, string RecoveryCode, string DeviceInfo) : IRequest<LoginResult>;

public class LoginWithRecoveryCodeCommandHandler : IRequestHandler<LoginWithRecoveryCodeCommand, LoginResult>
{
    private readonly IRepository<AppUser> _userRepository;
    private readonly IRepository<TwoFactorBackupCode> _backupCodeRepo;
    private readonly IRepository<UserSession> _sessionRepo;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public LoginWithRecoveryCodeCommandHandler(
        IRepository<AppUser> userRepository,
        IRepository<TwoFactorBackupCode> backupCodeRepo,
        IRepository<UserSession> sessionRepo,
        ITokenGenerator tokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _backupCodeRepo = backupCodeRepo;
        _sessionRepo = sessionRepo;
        _tokenGenerator = tokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginResult> Handle(LoginWithRecoveryCodeCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.RecoveryCode))
            throw new BadRequestException("Email và mã khôi phục không được để trống.");

        var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken)
                   ?? throw new UnauthorizedException("Xác thực thất bại.");

        if (!user.IsTwoFactorEnabled)
            throw new BadRequestException("Tài khoản chưa bật tính năng 2FA.");

        var codeHash = TwoFactorBackupCodeHelper.HashCode(request.RecoveryCode);

        var backupCode = await _backupCodeRepo.FirstOrDefaultAsync(
            b => b.UserId == user.Id && !b.IsUsed && b.CodeHash == codeHash, 
            cancellationToken);

        if (backupCode == null)
            throw new UnauthorizedException("Mã khôi phục không hợp lệ hoặc đã được sử dụng.");

        backupCode.MarkAsUsed();
        _backupCodeRepo.Update(backupCode);

        var role = await _unitOfWork.Roles.GetByIdAsync(user.RoleId, cancellationToken);
        string roleName = role?.Name ?? "Customer";

        var accessToken = _tokenGenerator.GenerateAccessToken(user, roleName);
        var refreshToken = _tokenGenerator.GenerateRefreshToken();

        var session = new UserSession
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RefreshTokenHash = RefreshTokenHasher.Hash(refreshToken),
            DeviceInfo = string.IsNullOrWhiteSpace(request.DeviceInfo) ? "2FA Recovery Code Login" : request.DeviceInfo,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        await _sessionRepo.AddAsync(session, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResult(accessToken, refreshToken, false, user.Email);
    }
}
