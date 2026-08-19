using OtpNet;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Exceptions;

namespace CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;

public record EnableTwoFactorCommand(Guid UserId, string SecretKey, string Code) : IRequest<bool>;

public class EnableTwoFactorCommandHandler : IRequestHandler<EnableTwoFactorCommand, bool>
{
    private readonly IRepository<AppUser> _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public EnableTwoFactorCommandHandler(IRepository<AppUser> userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(EnableTwoFactorCommand request, CancellationToken cancellationToken)
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
        catch
        {
            throw new BadRequestException("Secret Key hoặc mã OTP không hợp lệ.");
        }

        user.EnableTwoFactor(request.SecretKey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
