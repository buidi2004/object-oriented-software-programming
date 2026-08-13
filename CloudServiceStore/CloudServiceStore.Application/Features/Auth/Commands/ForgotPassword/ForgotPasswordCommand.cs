using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand(string Email) : IRequest<ForgotPasswordResult>;

public record ForgotPasswordResult(bool Success);
