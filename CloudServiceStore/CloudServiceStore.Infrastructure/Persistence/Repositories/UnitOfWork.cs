using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Interfaces;

namespace CloudServiceStore.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _dbContext;
    private IRoleRepository? _roles;

    public UnitOfWork(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IRoleRepository Roles => _roles ??= new RoleRepository(_dbContext);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
