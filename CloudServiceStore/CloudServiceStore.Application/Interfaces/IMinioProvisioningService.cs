using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IMinioProvisioningService
{
    Task<bool> CreateBucketAsync(string bucketName, string region, CancellationToken cancellationToken = default);
}
