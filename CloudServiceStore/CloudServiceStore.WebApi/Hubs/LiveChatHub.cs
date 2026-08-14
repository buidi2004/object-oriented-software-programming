using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.WebApi.Hubs;

[Authorize]
public class LiveChatHub : Hub
{
    private readonly ILogger<LiveChatHub> _logger;

    public LiveChatHub(ILogger<LiveChatHub> logger)
    {
        _logger = logger;
    }

    public async Task JoinChat(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
        _logger.LogInformation($"Client {Context.ConnectionId} joined chat session {sessionId}");
    }

    public async Task LeaveChat(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
        _logger.LogInformation($"Client {Context.ConnectionId} left chat session {sessionId}");
    }

    public override Task OnConnectedAsync()
    {
        _logger.LogInformation($"Client connected to LiveChatHub: {Context.ConnectionId}");
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation(exception, $"Client disconnected from LiveChatHub: {Context.ConnectionId}");
        return base.OnDisconnectedAsync(exception);
    }
}
