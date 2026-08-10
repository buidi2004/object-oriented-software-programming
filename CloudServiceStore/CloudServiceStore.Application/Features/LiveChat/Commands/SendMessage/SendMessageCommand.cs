using MediatR;
using System;

namespace CloudServiceStore.Application.Features.LiveChat.Commands.SendMessage;

public record SendMessageCommand(
    Guid ChatSessionId,
    Guid? SenderId,
    string? SenderName,
    string Content
) : IRequest<Guid>;
