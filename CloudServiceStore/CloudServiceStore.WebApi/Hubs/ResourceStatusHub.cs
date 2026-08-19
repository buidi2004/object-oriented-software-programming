using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Hubs;

public class ResourceStatusHub : Hub
{
    public async Task SubscribeToResource(string resourceType, string resourceId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"{resourceType}:{resourceId}");
    }
}
