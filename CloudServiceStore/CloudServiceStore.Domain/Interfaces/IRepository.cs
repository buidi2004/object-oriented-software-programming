using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq.Expressions;

using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Interfaces;

public interface IRepository<T> where T : AggregateRoot
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
    Task<IReadOnlyList<T>> WhereAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<T, object>>[] includes);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void Delete(T entity);
}
