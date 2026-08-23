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
    private readonly IPasswordHasher _passwordHasher;
    private readonly string _frontendBaseUrl;

    public ForgotPasswordCommandHandler(
        IRepository<AppUser> userRepo,
        IRepository<PasswordResetToken> tokenRepo,
        IUnitOfWork uow,
        ITokenGenerator tokenGenerator,
        IEmailService emailService,
        IPasswordHasher passwordHasher,
        Microsoft.Extensions.Options.IOptions<FrontendSettings> frontendOptions)
    {
        _userRepo = userRepo;
        _tokenRepo = tokenRepo;
        _uow = uow;
        _tokenGenerator = tokenGenerator;
        _emailService = emailService;
        _passwordHasher = passwordHasher;
        _frontendBaseUrl = (frontendOptions?.Value?.BaseUrl ?? "http://localhost:3000").TrimEnd('/');
    }

    public async Task<ForgotPasswordResult> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return new ForgotPasswordResult(false, false, "Vui lòng nhập địa chỉ email đã đăng ký.");

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepo.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user == null)
        {
            return new ForgotPasswordResult(
                false, 
                false, 
                "Không tìm thấy tài khoản với email này trong hệ thống SEN CloudHost. Vui lòng kiểm tra lại chính tả hoặc đăng ký tài khoản mới.");
        }

        // 1. Generate strong temporary password and update user password hash immediately
        var tempPassword = $"SenCloud#{Random.Shared.Next(100000, 999999)}";
        user.ChangePassword(_passwordHasher.Hash(tempPassword));
        _userRepo.Update(user);

        // 2. Generate secure 1-hour token if user wants to change custom password
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

        // 3. Send email containing both the new temporary password and the self-service reset link
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink, tempPassword, cancellationToken);

        await _uow.SaveChangesAsync(cancellationToken);

        return new ForgotPasswordResult(true, true, "Đã tìm thấy tài khoản! Hệ thống đã tự động cấp mật khẩu mới và gửi về email của bạn.");
    }
}
