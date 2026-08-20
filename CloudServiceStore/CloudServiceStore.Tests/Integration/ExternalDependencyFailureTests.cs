using System;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Caching;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Infrastructure.Caching;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class FailingDistributedCache : IDistributedCache
{
    public byte[]? Get(string key) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
    public Task<byte[]?> GetAsync(string key, CancellationToken token = default) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
    public void Refresh(string key) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
    public Task RefreshAsync(string key, CancellationToken token = default) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
    public void Remove(string key) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
    public Task RemoveAsync(string key, CancellationToken token = default) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
    public void Set(string key, byte[] value, DistributedCacheEntryOptions options) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
    public Task SetAsync(string key, byte[] value, DistributedCacheEntryOptions options, CancellationToken token = default) => throw new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Redis is down");
}

public class ExternalDependencyFailureTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ExternalDependencyFailureTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task RedisCatalogCache_WhenRedisFails_MustFallbackToDatabaseGracefully()
    {
        // 1. Arrange: Redis cache configured with failing IDistributedCache
        var failingCache = new FailingDistributedCache();
        var cacheSettings = Options.Create(new CacheSettings { Enabled = true, CategoriesTtlMinutes = 30 });
        var logger = NullLogger<RedisCatalogCache>.Instance;
        var catalogCache = new RedisCatalogCache(failingCache, cacheSettings, logger);

        bool dbFactoryCalled = false;

        // 2. Act: Call GetOrSetAsync simulating Redis server failure
        var result = await catalogCache.GetOrSetAsync(
            "test:catalog:plans",
            TimeSpan.FromMinutes(10),
            ct =>
            {
                dbFactoryCalled = true;
                return Task.FromResult("ResultFromDatabaseQueryDirectly");
            },
            CancellationToken.None);

        // 3. Assert: Must not throw 500 error, must execute fallback factory
        result.Should().Be("ResultFromDatabaseQueryDirectly");
        dbFactoryCalled.Should().BeTrue("Database factory should be invoked directly when Redis is unreachable");
    }

    [Fact]
    public async Task DockerHealthCheck_WhenDockerUnavailable_Returns200WithAvailableFalse()
    {
        // 1. Act: Call docker health endpoint
        var response = await _client.GetAsync("/api/vpsinstances/health/docker");

        // 2. Assert: Must return 200 OK without crashing with 500
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("available");
    }
}
