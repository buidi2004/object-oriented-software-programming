using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IResourceStatusNotifier
{
    Task NotifyStatusChangedAsync(string resourceType, string resourceId, string newStatus);
}
