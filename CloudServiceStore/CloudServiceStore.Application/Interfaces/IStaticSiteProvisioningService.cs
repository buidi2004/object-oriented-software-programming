using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface IStaticSiteProvisioningService
{
    Task<bool> ProvisionProjectAsync(StaticSite staticSite, CancellationToken cancellationToken = default);
}
