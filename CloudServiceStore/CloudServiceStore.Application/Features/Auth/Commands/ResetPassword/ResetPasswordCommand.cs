using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand(string Token, string NewPassword) : IRequest<Unit>;
