using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface IAppInstallerService
{
    Task<string> InstallAppAsync(AppInstallation installation, CancellationToken cancellationToken = default);
}
