using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface ICdnProvisioningService
{
    Task<string> CreateDistributionAsync(CdnDistribution distribution, CancellationToken cancellationToken = default);
}
