using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Common;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
{
    private readonly IRepository<PasswordResetToken> _tokenRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;
    private readonly IEmailService _emailService;

    public ResetPasswordCommandHandler(
        IRepository<PasswordResetToken> tokenRepo,
        IRepository<AppUser> userRepo,
        IUnitOfWork uow,
        IPasswordHasher hasher,
        IEmailService emailService)
    {
        _tokenRepo = tokenRepo;
        _userRepo = userRepo;
        _uow = uow;
        _hasher = hasher;
        _emailService = emailService;
    }

    public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = ResetTokenHasher.Hash(request.Token);
        var resetToken = await _tokenRepo.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (resetToken == null || !resetToken.IsValid(DateTime.UtcNow))
            throw new BadRequestException("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");

        var user = await _userRepo.GetByIdAsync(resetToken.UserId, cancellationToken)
            ?? throw new NotFoundException("Người dùng không tồn tại.");

        user.ChangePassword(_hasher.Hash(request.NewPassword));
        resetToken.MarkUsed();

        _userRepo.Update(user);
        _tokenRepo.Update(resetToken);
        await _uow.SaveChangesAsync(cancellationToken);

        await _emailService.SendPasswordChangedSecurityAlertAsync(user.Email, user.FullName, cancellationToken);

        return Unit.Value;
    }
}
