using System.Text.Json;
using CloudServiceStore.Application.Caching;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace CloudServiceStore.Infrastructure.Caching;

public class RedisCatalogCache : ICatalogCache
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer? _redis;
    private readonly CacheSettings _settings;
    private readonly ILogger<RedisCatalogCache> _logger;

    public RedisCatalogCache(
        IDistributedCache cache,
        IOptions<CacheSettings> settings,
        ILogger<RedisCatalogCache> logger,
        IConnectionMultiplexer? redis = null)
    {
        _cache = cache;
        _redis = redis;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<T> GetOrSetAsync<T>(
        string key,
        TimeSpan ttl,
        Func<CancellationToken, Task<T>> factory,
        CancellationToken cancellationToken)
    {
        if (!_settings.Enabled)
        {
            return await factory(cancellationToken);
        }

        try
        {
            var cached = await _cache.GetStringAsync(key, cancellationToken);
            if (!string.IsNullOrEmpty(cached))
            {
                var deserialized = JsonSerializer.Deserialize<T>(cached, JsonOptions);
                if (deserialized is not null)
                {
                    return deserialized;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache read failed for key {CacheKey}", key);
        }

        var value = await factory(cancellationToken);

        try
        {
            await _cache.SetStringAsync(
                key,
                JsonSerializer.Serialize(value, JsonOptions),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = ttl
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cache write failed for key {CacheKey}", key);
        }

        return value;
    }

    public async Task InvalidateCatalogAsync(CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            return;
        }

        try
        {
            if (_redis is not null)
            {
                var db = _redis.GetDatabase();
                var endpoints = _redis.GetEndPoints();
                if (endpoints.Length > 0)
                {
                    var server = _redis.GetServer(endpoints[0]);
                    await DeleteByPatternAsync(server, db, $"{CatalogCacheKeys.CatalogPrefix}*");
                    await DeleteByPatternAsync(server, db, $"{CatalogCacheKeys.ContentPrefix}faqs:*");
                }
            }
            else
            {
                await _cache.RemoveAsync(CatalogCacheKeys.Categories, cancellationToken);
                await _cache.RemoveAsync(CatalogCacheKeys.ExchangeRates, cancellationToken);
                await _cache.RemoveAsync(CatalogCacheKeys.Faqs, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Catalog cache invalidation failed");
        }
    }

    private static async Task DeleteByPatternAsync(IServer server, IDatabase db, string pattern)
    {
        foreach (var key in server.Keys(pattern: pattern))
        {
            await db.KeyDeleteAsync(key);
        }
    }
}
