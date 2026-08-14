using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Commands.LockUser;

public record LockUserCommand(Guid UserId) : IRequest;
