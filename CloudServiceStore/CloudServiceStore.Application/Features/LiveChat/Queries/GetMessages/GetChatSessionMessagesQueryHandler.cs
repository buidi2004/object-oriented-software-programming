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
        var messages = await _messageRepository.WhereAsync(m => m.ChatSessionId == request.ChatSessionId);

        return messages
            .OrderBy(m => m.SentAt)
            .Select(m => new ChatMessageDto(
                m.Id,
                m.SenderId,
                m.SenderName,
                m.Content,
                m.SentAt
            ))
            .ToList();
    }
}
