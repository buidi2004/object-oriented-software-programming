using OtpNet;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Exceptions;

namespace CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;

public record SetupTwoFactorCommand(Guid UserId) : IRequest<SetupTwoFactorResult>;
public record SetupTwoFactorResult(string SecretKey, string OtpAuthUri);

public class SetupTwoFactorCommandHandler : IRequestHandler<SetupTwoFactorCommand, SetupTwoFactorResult>
{
    private readonly IRepository<AppUser> _userRepository;

    public SetupTwoFactorCommandHandler(IRepository<AppUser> userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<SetupTwoFactorResult> Handle(SetupTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken) 
                   ?? throw new NotFoundException("Người dùng không tồn tại.");

        var secretKeyBytes = KeyGeneration.GenerateRandomKey(20);
        var secretKey = Base32Encoding.ToString(secretKeyBytes);

        var issuer = "CloudServiceStore";
        var otpAuthUri = $"otpauth://totp/{issuer}:{Uri.EscapeDataString(user.Email)}?secret={secretKey}&issuer={issuer}&digits=6&period=30";

        return new SetupTwoFactorResult(secretKey, otpAuthUri);
    }
}
