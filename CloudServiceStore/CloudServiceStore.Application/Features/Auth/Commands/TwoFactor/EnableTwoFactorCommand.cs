using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using OtpNet;
using MediatR;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Exceptions;

namespace CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;

public record EnableTwoFactorResult(bool Success, List<string> BackupCodes);
public record EnableTwoFactorCommand(Guid UserId, string SecretKey, string Code) : IRequest<EnableTwoFactorResult>;

public class EnableTwoFactorCommandHandler : IRequestHandler<EnableTwoFactorCommand, EnableTwoFactorResult>
{
    private readonly IRepository<AppUser> _userRepository;
    private readonly IRepository<TwoFactorBackupCode> _backupCodeRepo;
    private readonly IUnitOfWork _unitOfWork;

    public EnableTwoFactorCommandHandler(
        IRepository<AppUser> userRepository, 
        IRepository<TwoFactorBackupCode> backupCodeRepo,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _backupCodeRepo = backupCodeRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<EnableTwoFactorResult> Handle(EnableTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken) 
                   ?? throw new NotFoundException("Người dùng không tồn tại.");

        try
        {
            var secretBytes = Base32Encoding.ToBytes(request.SecretKey);
            var totp = new Totp(secretBytes);

            bool isValid = totp.VerifyTotp(request.Code, out _, new VerificationWindow(previous: 1, future: 1));

            if (!isValid)
                throw new BadRequestException("Mã xác thực không hợp lệ hoặc đã hết hạn.");
        }
        catch (Exception ex) when (ex is not BadRequestException)
        {
            throw new BadRequestException("Secret Key hoặc mã OTP không hợp lệ.");
        }

        user.EnableTwoFactor(request.SecretKey);

        // Remove old unused codes if any
        var existingCodes = await _backupCodeRepo.WhereAsync(b => b.UserId == user.Id, cancellationToken);
        foreach (var c in existingCodes)
        {
            _backupCodeRepo.Delete(c);
        }

        // Generate 10 new backup codes
        var generatedCodes = new List<string>();
        for (int i = 0; i < 10; i++)
        {
            var rawCode = TwoFactorBackupCodeHelper.GenerateCode();
            generatedCodes.Add(rawCode);
            var hash = TwoFactorBackupCodeHelper.HashCode(rawCode);
            var backupEntity = new TwoFactorBackupCode(user.Id, hash);
            await _backupCodeRepo.AddAsync(backupEntity, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new EnableTwoFactorResult(true, generatedCodes);
    }
}
