using MediatR;
using System;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.LiveChat.Queries.GetMessages;

public record GetChatSessionMessagesQuery(Guid ChatSessionId) : IRequest<List<ChatMessageDto>>;
