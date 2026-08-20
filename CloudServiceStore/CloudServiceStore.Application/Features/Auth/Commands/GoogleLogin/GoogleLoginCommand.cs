using CloudServiceStore.Application.Features.Auth.Commands.Login;
using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.GoogleLogin;

public record GoogleLoginCommand(string Credential) : IRequest<LoginResult>;
