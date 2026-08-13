namespace CloudServiceStore.Application.Interfaces;

public interface ICatalogCache
{
    Task<T> GetOrSetAsync<T>(
        string key,
        TimeSpan ttl,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken);

    Task InvalidateCatalogAsync(CancellationToken cancellationToken = default);
}
