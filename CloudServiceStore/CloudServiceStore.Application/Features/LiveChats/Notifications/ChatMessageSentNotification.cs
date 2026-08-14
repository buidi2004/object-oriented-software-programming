using System;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Notifications;

public record ChatMessageSentNotification(
    Guid Id,
    Guid SessionId,
    Guid SenderId,
    string Message,
    DateTime CreatedAt
) : INotification;
