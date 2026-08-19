using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Security;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Google.Apis.Auth;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace CloudServiceStore.Application.Features.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, LoginResult>
{
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<UserSession> _sessionRepo;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _googleClientId;
    private readonly IPasswordHasher _hasher;

    public GoogleLoginCommandHandler(
        IRepository<AppUser> userRepo,
        IRepository<UserSession> sessionRepo,
        ITokenGenerator tokenGenerator,
        IUnitOfWork unitOfWork,
        IConfiguration config,
        IPasswordHasher hasher)
    {
        _userRepo = userRepo;
        _sessionRepo = sessionRepo;
        _tokenGenerator = tokenGenerator;
        _unitOfWork = unitOfWork;
        _googleClientId = config["GoogleAuth:ClientId"] ?? throw new ArgumentNullException("GoogleAuth:ClientId");
        _hasher = hasher;
    }

    public async Task<LoginResult> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _googleClientId }
        };

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, settings);
        }
        catch (InvalidJwtException ex)
        {
            throw new Exception("Invalid Google token.", ex);
        }

        var user = await _userRepo.FirstOrDefaultAsync(u => u.Email == payload.Email, cancellationToken);

        if (user == null)
        {
            var roleId = await _unitOfWork.Roles.GetIdByNameAsync("Customer", cancellationToken);
            var randomPassword = Guid.NewGuid().ToString();

            // Register new user automatically
            user = new AppUser(
                payload.Name, // FullName
                payload.Email, // Email
                _hasher.Hash(randomPassword), // PasswordHash
                roleId,
                "", "", "", "", "", "", "", "", ""
            );
            await _userRepo.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var role = await _unitOfWork.Roles.GetByIdAsync(user.RoleId, cancellationToken);
        string roleName = role?.Name ?? "Customer";

        if (user.IsTwoFactorEnabled)
        {
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
            DeviceInfo = "Google Auth",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };
        await _sessionRepo.AddAsync(session, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResult(accessToken, refreshToken);
    }
}
