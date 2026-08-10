using System;

namespace CloudServiceStore.Application.Features.LiveChat.Queries.GetMessages;

public record ChatMessageDto(
    Guid Id,
    Guid? SenderId,
    string? SenderName,
    string Content,
    DateTime SentAt
);
