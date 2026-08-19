using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password, string IpAddress, string UserAgent, string DeviceInfo) 
    : IRequest<LoginResult>;

public record LoginResult(string AccessToken, string RefreshToken, bool RequiresTwoFactor = false, string? Email = null);
