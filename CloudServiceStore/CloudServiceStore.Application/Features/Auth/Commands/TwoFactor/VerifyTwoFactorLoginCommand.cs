using OtpNet;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using System;
using CloudServiceStore.Application.Security;

namespace CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;

public record VerifyTwoFactorLoginCommand(string Email, string Code, string DeviceInfo) : IRequest<LoginResult>;

public class VerifyTwoFactorLoginCommandHandler : IRequestHandler<VerifyTwoFactorLoginCommand, LoginResult>
{
    private readonly IRepository<AppUser> _userRepository;
    private readonly IRepository<UserSession> _sessionRepo;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public VerifyTwoFactorLoginCommandHandler(
        IRepository<AppUser> userRepository, 
        IRepository<UserSession> sessionRepo,
        ITokenGenerator tokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _sessionRepo = sessionRepo;
        _tokenGenerator = tokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginResult> Handle(VerifyTwoFactorLoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken) 
                   ?? throw new UnauthorizedException("Xác thực thất bại.");

        if (!user.IsTwoFactorEnabled || string.IsNullOrEmpty(user.TwoFactorSecretKey))
            throw new BadRequestException("Tài khoản chưa bật tính năng 2FA.");

        var secretBytes = Base32Encoding.ToBytes(user.TwoFactorSecretKey);
        var totp = new Totp(secretBytes);

        bool isValid = totp.VerifyTotp(request.Code, out _, new VerificationWindow(previous: 1, future: 1));
        if (!isValid)
            throw new BadRequestException("Mã xác thực 2FA không chính xác hoặc đã hết hạn.");

        var role = await _unitOfWork.Roles.GetByIdAsync(user.RoleId, cancellationToken);
        string roleName = role?.Name ?? "Customer";

        var accessToken = _tokenGenerator.GenerateAccessToken(user, roleName);
        var refreshToken = _tokenGenerator.GenerateRefreshToken();

        var session = new UserSession
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            RefreshTokenHash = RefreshTokenHasher.Hash(refreshToken),
            DeviceInfo = request.DeviceInfo,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };
        await _sessionRepo.AddAsync(session, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResult(accessToken, refreshToken, false, user.Email);
    }
}
