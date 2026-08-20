using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface IDatabaseProvisioningService
{
    Task<int> ProvisionDatabaseAsync(ManagedDatabaseInstance instance, CancellationToken cancellationToken = default);
}
