using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Infrastructure.Persistence.Repositories;

public class Repository<T> : IRepository<T> where T : AggregateRoot
{
    protected readonly AppDbContext _dbContext;
    protected readonly DbSet<T> _dbSet;

    public Repository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        if (includes != null)
        {
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
        }
        return await query.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        if (includes != null)
        {
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
        }
        return await query.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public async Task<IReadOnlyList<T>> WhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(predicate, cancellationToken);
    }

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public void Update(T entity)
    {
        _dbContext.Entry(entity).State = EntityState.Modified;
    }

    public void Delete(T entity)
    {
        _dbSet.Remove(entity);
    }
}
