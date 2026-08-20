using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Tests.Mocks;

public class MockAppInstallerService : IAppInstallerService
{
    public Task<string> InstallAppAsync(AppInstallation installation, CancellationToken cancellationToken = default)
    {
        return Task.FromResult("http://localhost:8080");
    }
}
