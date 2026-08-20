using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IResourceProvisioningQueue
{
    ValueTask QueueBackgroundWorkItemAsync(Func<IServiceProvider, CancellationToken, ValueTask> workItem);

    ValueTask<Func<IServiceProvider, CancellationToken, ValueTask>> DequeueAsync(CancellationToken cancellationToken);
}
