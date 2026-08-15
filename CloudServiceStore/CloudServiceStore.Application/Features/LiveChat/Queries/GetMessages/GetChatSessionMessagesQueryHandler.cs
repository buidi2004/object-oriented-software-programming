using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.LiveChat.Queries.GetMessages;

public class GetChatSessionMessagesQueryHandler : IRequestHandler<GetChatSessionMessagesQuery, List<ChatMessageDto>>
{
    private readonly IRepository<ChatMessage> _messageRepository;

    public GetChatSessionMessagesQueryHandler(IRepository<ChatMessage> messageRepository)
    {
        _messageRepository = messageRepository;
    }

    public async Task<List<ChatMessageDto>> Handle(GetChatSessionMessagesQuery request, CancellationToken cancellationToken)
    {
        var messages = await _messageRepository.WhereAsync(m => m.SessionId == request.ChatSessionId);

        return messages
            .OrderBy(m => m.CreatedAt)
            .Select(m => new ChatMessageDto(
                m.Id,
                m.SenderId,
                "User", // Dummy SenderName since it's not in the entity
                m.Message,
                m.CreatedAt
            ))
            .ToList();
    }
}
