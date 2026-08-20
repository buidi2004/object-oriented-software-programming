using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface IGameServerProvisioningService
{
    Task<int> ProvisionGameServerAsync(GameServerInstance instance, CancellationToken cancellationToken = default);
}
