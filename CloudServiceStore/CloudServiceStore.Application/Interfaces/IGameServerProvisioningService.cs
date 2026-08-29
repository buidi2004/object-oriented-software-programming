using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface IGameServerProvisioningService
{
    Task<int> ProvisionGameServerAsync(GameServerInstance instance, CancellationToken cancellationToken = default);
    Task DeleteGameServerAsync(string containerId, CancellationToken cancellationToken = default);
    Task RestartGameServerAsync(string containerId, CancellationToken cancellationToken = default);
    Task StopGameServerAsync(string containerId, CancellationToken cancellationToken = default);
    Task StartGameServerAsync(string containerId, CancellationToken cancellationToken = default);
    Task<System.Collections.Generic.IEnumerable<string>> GetLogsAsync(string containerId, int tailCount = 100, CancellationToken cancellationToken = default);
    Task<CloudServiceStore.Application.DTOs.GameServerStatsDto> GetStatsAsync(string containerId, CancellationToken cancellationToken = default);
    Task<string> ExecuteCommandAsync(string containerId, string command, CancellationToken cancellationToken = default);
}
