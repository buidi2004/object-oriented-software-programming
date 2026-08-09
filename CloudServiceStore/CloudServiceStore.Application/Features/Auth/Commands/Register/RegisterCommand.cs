using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string FullName, string Email, string Password, string? PhoneNumber)
    : IRequest<RegisterResult>;

public record RegisterResult(Guid UserId, string Email);
