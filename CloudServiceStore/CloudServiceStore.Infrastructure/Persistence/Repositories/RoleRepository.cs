using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Infrastructure.Persistence.Repositories;

public class RoleRepository : Repository<Role>, IRoleRepository
{
    public RoleRepository(AppDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<Guid> GetIdByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        var role = await _dbSet.FirstOrDefaultAsync(r => r.Name == name, cancellationToken);
        return role?.Id ?? Guid.Empty;
    }
}
