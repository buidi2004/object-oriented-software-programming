using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CloudServiceStore.WebApi.Services;

public class SignalRResourceStatusNotifier : IResourceStatusNotifier
{
    private readonly IHubContext<ResourceStatusHub> _hubContext;

    public SignalRResourceStatusNotifier(IHubContext<ResourceStatusHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyStatusChangedAsync(string resourceType, string resourceId, string newStatus)
    {
        await _hubContext.Clients.Group($"{resourceType}:{resourceId}")
            .SendAsync("StatusChanged", resourceId, newStatus);
    }
}
