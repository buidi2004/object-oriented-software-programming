using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.LiveChats.Notifications;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace CloudServiceStore.WebApi.Hubs;

public class ChatMessageSentNotificationHandler : INotificationHandler<ChatMessageSentNotification>
{
    private readonly IHubContext<LiveChatHub> _hubContext;

    public ChatMessageSentNotificationHandler(IHubContext<LiveChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task Handle(ChatMessageSentNotification notification, CancellationToken cancellationToken)
    {
        await _hubContext.Clients.Group(notification.SessionId.ToString()).SendAsync("ReceiveMessage", new
        {
            id = notification.Id,
            sessionId = notification.SessionId,
            senderId = notification.SenderId,
            message = notification.Message,
            createdAt = notification.CreatedAt
        }, cancellationToken);
    }
}
