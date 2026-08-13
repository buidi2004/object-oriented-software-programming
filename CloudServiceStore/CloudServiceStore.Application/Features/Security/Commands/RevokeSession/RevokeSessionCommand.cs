using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Security.Commands.RevokeSession;

public record RevokeSessionCommand(Guid SessionId) : IRequest;
