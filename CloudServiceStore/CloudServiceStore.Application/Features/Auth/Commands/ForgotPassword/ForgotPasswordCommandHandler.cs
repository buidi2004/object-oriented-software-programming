using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Common;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResult>
{
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<PasswordResetToken> _tokenRepo;
    private readonly IUnitOfWork _uow;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IEmailService _emailService;
    private readonly string _frontendBaseUrl;

    public ForgotPasswordCommandHandler(
        IRepository<AppUser> userRepo,
        IRepository<PasswordResetToken> tokenRepo,
        IUnitOfWork uow,
        ITokenGenerator tokenGenerator,
        IEmailService emailService,
        Microsoft.Extensions.Options.IOptions<FrontendSettings> frontendOptions)
    {
        _userRepo = userRepo;
        _tokenRepo = tokenRepo;
        _uow = uow;
        _tokenGenerator = tokenGenerator;
        _emailService = emailService;
        _frontendBaseUrl = frontendOptions.Value.BaseUrl.TrimEnd('/');
    }

    public async Task<ForgotPasswordResult> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user != null)
        {
            var plainToken = _tokenGenerator.GenerateRefreshToken();
            var resetToken = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = ResetTokenHasher.Hash(plainToken),
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _tokenRepo.AddAsync(resetToken, cancellationToken);

            var resetLink = $"{_frontendBaseUrl}/reset-password?token={Uri.EscapeDataString(plainToken)}";
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink, cancellationToken);

            await _uow.SaveChangesAsync(cancellationToken);
        }

        return new ForgotPasswordResult(true);
    }
}
