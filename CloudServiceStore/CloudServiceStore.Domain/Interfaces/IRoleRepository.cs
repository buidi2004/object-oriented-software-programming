using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Domain.Interfaces;

public interface IRoleRepository : IRepository<Role>
{
    Task<Guid> GetIdByNameAsync(string name, CancellationToken cancellationToken = default);
}
