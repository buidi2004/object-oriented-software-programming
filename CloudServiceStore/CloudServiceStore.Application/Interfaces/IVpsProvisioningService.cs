using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IVpsProvisioningService
{
    Task<string> ProvisionAsync(Guid orderId, Guid userId, CancellationToken ct);
    Task<string> ExecCommandAsync(string containerId, string command, CancellationToken ct);
    Task TerminateAsync(string containerId, CancellationToken ct);
    Task<bool> IsRunningAsync(string containerId, CancellationToken ct);
}
