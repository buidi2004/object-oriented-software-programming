using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Queries.GetSessionMessages;

public record ChatMessageDto(Guid Id, Guid SenderId, string Message, DateTime CreatedAt);

public record GetSessionMessagesQuery(Guid SessionId) : IRequest<IReadOnlyList<ChatMessageDto>>;
