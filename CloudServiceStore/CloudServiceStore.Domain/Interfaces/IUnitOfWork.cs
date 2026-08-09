using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Domain.Interfaces;

public interface IUnitOfWork
{
    IRoleRepository Roles { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
