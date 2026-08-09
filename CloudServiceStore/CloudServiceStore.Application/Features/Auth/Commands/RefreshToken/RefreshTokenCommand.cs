using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenResult>;
public record RefreshTokenResult(string AccessToken, string RefreshToken);
