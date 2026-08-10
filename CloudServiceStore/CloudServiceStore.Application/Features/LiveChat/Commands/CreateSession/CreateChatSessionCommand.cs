using MediatR;
using System;

namespace CloudServiceStore.Application.Features.LiveChat.Commands.CreateSession;

public record CreateChatSessionCommand(
    Guid? UserId,
    string? GuestName
) : IRequest<Guid>;
