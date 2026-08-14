using CloudServiceStore.Application.Caching;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Infrastructure.Caching;
using FluentAssertions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Infrastructure;

public class CatalogCacheKeysTests
{
    [Fact]
    public void CategoryPlansKey_ShouldNormalizeSlugAndCurrency()
    {
        var key = CatalogCacheKeys.CategoryPlans("Cloud-VPS", "vnd");
        key.Should().Be("catalog:cat-plans:cloud-vps:VND:v1");
    }

    [Fact]
    public void ServicePlanKey_ShouldIncludePlanIdAndCurrency()
    {
        var planId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var key = CatalogCacheKeys.ServicePlan(planId, "usd");
        key.Should().Contain(planId.ToString("N"));
        key.Should().Contain("USD");
    }

    [Fact]
    public void ActivePromotionsKey_ShouldBeStable()
    {
        CatalogCacheKeys.ActivePromotions.Should().Be("catalog:promotions:active:v1");
    }
}

public class RedisCatalogCacheTests
{
    [Fact]
    public async Task GetOrSetAsync_WhenDisabled_ShouldBypassCache()
    {
        var cache = new RedisCatalogCache(
            Mock.Of<IDistributedCache>(),
            Options.Create(new CacheSettings { Enabled = false }),
            Mock.Of<ILogger<RedisCatalogCache>>());

        var calls = 0;
        var result = await cache.GetOrSetAsync(
            CatalogCacheKeys.Categories,
            CatalogCacheKeys.CategoriesTtl,
            _ =>
            {
                calls++;
                return Task.FromResult("fresh");
            },
            CancellationToken.None);

        result.Should().Be("fresh");
        calls.Should().Be(1);
    }
}
