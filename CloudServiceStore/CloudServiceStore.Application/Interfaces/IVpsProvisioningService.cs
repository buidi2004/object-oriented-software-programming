using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Models;

namespace CloudServiceStore.Application.Interfaces;

public interface IVpsProvisioningService
{
    Task<ProvisionResult> ProvisionAsync(VpsProvisionSpec spec, CancellationToken ct);
    Task<string> ExecCommandAsync(string containerId, string command, CancellationToken ct);
    Task TerminateAsync(string containerId, CancellationToken ct);
    Task<bool> IsRunningAsync(string containerId, CancellationToken ct);
    Task<bool> IsAvailableAsync(CancellationToken ct);
    Task StartAsync(string containerId, CancellationToken ct);
    Task StopAsync(string containerId, CancellationToken ct);
    Task RestartAsync(string containerId, CancellationToken ct);
}
