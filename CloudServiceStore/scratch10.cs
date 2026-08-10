using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq.Expressions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using System.Collections.Generic;
using System.Linq;

class FakeCartRepo : IRepository<Cart>
{
    public Task<Cart?> FirstOrDefaultAsync(Expression<Func<Cart, bool>> predicate, CancellationToken cancellationToken = default, params Expression<Func<Cart, object>>[] includes)
    {
        return Task.FromResult<Cart?>(null);
    }

    public Task<Cart> AddAsync(Cart entity, CancellationToken cancellationToken = default) => Task.FromResult(entity);
    
    // Unimplemented methods
    public Task<IReadOnlyList<Cart>> GetAllAsync(CancellationToken ct = default, params Expression<Func<Cart, object>>[] includes) => throw new NotImplementedException();
    public Task<IReadOnlyList<Cart>> GetPagedAsync(int p, int s, CancellationToken ct = default, params Expression<Func<Cart, object>>[] includes) => throw new NotImplementedException();
    public Task<Cart?> GetByIdAsync(Guid id, CancellationToken ct = default, params Expression<Func<Cart, object>>[] includes) => throw new NotImplementedException();
    public Task UpdateAsync(Cart entity, CancellationToken ct = default) => throw new NotImplementedException();
    public Task DeleteAsync(Cart entity, CancellationToken ct = default) => throw new NotImplementedException();
    public Task<bool> AnyAsync(Expression<Func<Cart, bool>> p, CancellationToken ct = default) => throw new NotImplementedException();
    public Task<int> CountAsync(Expression<Func<Cart, bool>> p, CancellationToken ct = default) => throw new NotImplementedException();
    public Task<IReadOnlyList<Cart>> FindAsync(Expression<Func<Cart, bool>> p, CancellationToken ct = default, params Expression<Func<Cart, object>>[] includes) => throw new NotImplementedException();
}

class Program
{
    static async Task Main()
    {
        var repo = new FakeCartRepo();
        var cart = await repo.FirstOrDefaultAsync(c => c.UserId == Guid.NewGuid());
        Console.WriteLine($"Cart is null? {cart == null}");
    }
}
