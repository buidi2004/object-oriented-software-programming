using MediatR;

namespace CloudServiceStore.Application.Features.Security.Commands.ChangePassword;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword
) : IRequest<Unit>;
