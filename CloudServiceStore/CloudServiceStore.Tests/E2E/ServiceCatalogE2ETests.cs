using System;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Features.ServicePlans.Commands.UpdateSeo;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

/// <summary>
/// E2E cho luồng catalog sản phẩm/dịch vụ:
/// categories → plans theo slug (kèm alias) → plan detail → reviews/SEO → add to cart.
/// </summary>
public class ServiceCatalogE2ETests : BaseE2ETest
{
    public ServiceCatalogE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task ServiceCatalog_FullPublicAndPurchaseFlow_ShouldWorkEndToEnd()
    {
        // ── 1. Seed catalog (mirror DbSeeder: cloud-vps, web-hosting, ten-mien) ──
        var (vpsPlanId, hostingPlanId, domainPlanId, vpsCategoryId) = await SeedServiceCatalogAsync();

        Client.DefaultRequestHeaders.Authorization = null;

        // ── 2. GET /api/categories — danh sách danh mục public ──
        var categoriesRes = await Client.GetAsync("/api/categories");
        categoriesRes.EnsureSuccessStatusCode();
        var categories = await categoriesRes.Content.ReadFromJsonAsync<JsonElement>();
        categories.GetArrayLength().Should().BeGreaterOrEqualTo(3);
        categories.EnumerateArray().Select(c => c.GetProperty("slug").GetString()).Should()
            .Contain(new[] { "cloud-vps", "web-hosting", "ten-mien" });

        // ── 3. GET /api/categories/{slug}/plans — bảng giá theo category ──
        var vpsPlansRes = await Client.GetAsync("/api/categories/cloud-vps/plans?currency=VND");
        vpsPlansRes.EnsureSuccessStatusCode();
        var vpsPlans = await vpsPlansRes.Content.ReadFromJsonAsync<JsonElement>();
        vpsPlans.GetProperty("categorySlug").GetString().Should().Be("cloud-vps");
        vpsPlans.GetProperty("plans").GetArrayLength().Should().BeGreaterThan(0);

        var vpsPlanCard = vpsPlans.GetProperty("plans").EnumerateArray()
            .First(p => p.GetProperty("id").GetGuid() == vpsPlanId);
        vpsPlanCard.GetProperty("name").GetString().Should().Be("Cloud VPS Pro");
        vpsPlanCard.GetProperty("cpu").GetString().Should().Be("8 Core");
        vpsPlanCard.GetProperty("monthlyPrice").GetDecimal().Should().Be(650_000);
        vpsPlanCard.GetProperty("yearlyPrice").GetDecimal().Should().Be(6_240_000);

        // ── 4. Slug alias FE: hosting → web-hosting, domain → ten-mien, vps → cloud-vps ──
        var vpsAliasRes = await Client.GetAsync("/api/categories/vps/plans");
        vpsAliasRes.EnsureSuccessStatusCode();
        var vpsAlias = await vpsAliasRes.Content.ReadFromJsonAsync<JsonElement>();
        vpsAlias.GetProperty("categorySlug").GetString().Should().Be("cloud-vps");
        vpsAlias.GetProperty("plans").EnumerateArray()
            .Any(p => p.GetProperty("id").GetGuid() == vpsPlanId).Should().BeTrue();

        var hostingAliasRes = await Client.GetAsync("/api/categories/hosting/plans");
        hostingAliasRes.EnsureSuccessStatusCode();
        var hostingAlias = await hostingAliasRes.Content.ReadFromJsonAsync<JsonElement>();
        hostingAlias.GetProperty("categorySlug").GetString().Should().Be("web-hosting");
        hostingAlias.GetProperty("plans").EnumerateArray()
            .Any(p => p.GetProperty("id").GetGuid() == hostingPlanId).Should().BeTrue();

        var domainAliasRes = await Client.GetAsync("/api/categories/domain/plans");
        domainAliasRes.EnsureSuccessStatusCode();
        var domainAlias = await domainAliasRes.Content.ReadFromJsonAsync<JsonElement>();
        domainAlias.GetProperty("categorySlug").GetString().Should().Be("ten-mien");
        domainAlias.GetProperty("plans").EnumerateArray()
            .Any(p => p.GetProperty("id").GetGuid() == domainPlanId).Should().BeTrue();

        // ── 5. GET /api/service-plans/{id} — chi tiết plan (specs + prices + promotions) ──
        var detailRes = await Client.GetAsync($"/api/service-plans/{vpsPlanId}?currency=VND");
        detailRes.EnsureSuccessStatusCode();
        var detail = await detailRes.Content.ReadFromJsonAsync<JsonElement>();
        detail.GetProperty("id").GetGuid().Should().Be(vpsPlanId);
        detail.GetProperty("name").GetString().Should().Be("Cloud VPS Pro");
        detail.GetProperty("categorySlug").GetString().Should().Be("cloud-vps");
        detail.GetProperty("cpu").GetString().Should().Be("8 Core");
        detail.GetProperty("ram").GetString().Should().Be("16GB");
        detail.GetProperty("ssd").GetString().Should().Be("150GB NVMe");
        detail.GetProperty("bandwidth").GetString().Should().Be("Unlimited");
        detail.GetProperty("isActive").GetBoolean().Should().BeTrue();

        var prices = detail.GetProperty("prices");
        prices.GetArrayLength().Should().Be(2);
        prices.EnumerateArray().Select(p => p.GetProperty("billingCycle").GetInt32())
            .Should().Contain(new[] { (int)BillingCycle.Monthly, (int)BillingCycle.Yearly });

        var promotions = detail.GetProperty("activePromotions");
        promotions.GetArrayLength().Should().Be(1);
        promotions[0].GetProperty("discountPercent").GetDecimal().Should().Be(15);

        // ── 6. GET /api/service-plans?currency=VND — list giá (legacy, vẫn dùng cho admin SEO) ──
        var priceListRes = await Client.GetAsync("/api/service-plans?currency=VND");
        priceListRes.EnsureSuccessStatusCode();
        var priceList = await priceListRes.Content.ReadFromJsonAsync<JsonElement>();
        priceList.GetArrayLength().Should().BeGreaterThan(0);
        priceList.EnumerateArray().Any(p => p.GetProperty("servicePlanId").GetGuid() == vpsPlanId)
            .Should().BeTrue();

        // ── 7. SEO sub-resource ──
        var adminToken = await RegisterAndLoginAdminAsync("admin_catalog@test.com", "Admin@123!");
        SetAuthToken(adminToken);
        var seoUpdate = new UpdateSeoCommand(vpsPlanId, "Cloud VPS Pro SEO", "Mô tả SEO test", "vps,cloud", "https://cdn.example/og.png");
        var seoPutRes = await Client.PutAsJsonAsync($"/api/service-plans/{vpsPlanId}/seo", seoUpdate);
        seoPutRes.EnsureSuccessStatusCode();

        Client.DefaultRequestHeaders.Authorization = null;
        var seoGetRes = await Client.GetAsync($"/api/service-plans/{vpsPlanId}/seo");
        seoGetRes.EnsureSuccessStatusCode();
        var seo = await seoGetRes.Content.ReadFromJsonAsync<JsonElement>();
        seo.GetProperty("metaTitle").GetString().Should().Be("Cloud VPS Pro SEO");

        // ── 8. Reviews theo plan (public read) ──
        var customerToken = await RegisterAndLoginCustomerAsync("customer_catalog@test.com", "Cust@123!");
        SetAuthToken(customerToken);
        var reviewRes = await Client.PostAsJsonAsync("/api/reviews", new
        {
            servicePlanId = vpsPlanId,
            rating = 5,
            comment = "VPS rất nhanh, hỗ trợ tốt!"
        });
        reviewRes.EnsureSuccessStatusCode();
        var reviewId = (await reviewRes.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();

        SetAuthToken(adminToken);
        (await Client.PatchAsync($"/api/reviews/{reviewId}/approve", null)).EnsureSuccessStatusCode();

        Client.DefaultRequestHeaders.Authorization = null;
        var reviewsRes = await Client.GetAsync($"/api/reviews/service-plan/{vpsPlanId}");
        reviewsRes.EnsureSuccessStatusCode();
        var reviews = await reviewsRes.Content.ReadFromJsonAsync<JsonElement>();
        reviews.GetArrayLength().Should().Be(1);
        reviews[0].GetProperty("comment").GetString().Should().Contain("VPS rất nhanh");

        // ── 9. Customer add to cart từ plan detail (luồng mua hàng) ──
        SetAuthToken(customerToken);
        var addToCartRes = await Client.PostAsJsonAsync("/api/carts/items",
            new AddToCartCommand(vpsPlanId, BillingCycle.Monthly, 1));
        addToCartRes.EnsureSuccessStatusCode();

        var cartRes = await Client.GetAsync("/api/carts/me");
        cartRes.EnsureSuccessStatusCode();
        var cart = await cartRes.Content.ReadFromJsonAsync<JsonElement>();
        cart.GetProperty("items").GetArrayLength().Should().Be(1);
        cart.GetProperty("items")[0].GetProperty("servicePlanId").GetGuid().Should().Be(vpsPlanId);

        // ── 10. Domain plan chỉ có yearly price ──
        Client.DefaultRequestHeaders.Authorization = null;
        var domainDetailRes = await Client.GetAsync($"/api/service-plans/{domainPlanId}");
        domainDetailRes.EnsureSuccessStatusCode();
        var domainDetail = await domainDetailRes.Content.ReadFromJsonAsync<JsonElement>();
        domainDetail.GetProperty("categorySlug").GetString().Should().Be("ten-mien");
        domainDetail.GetProperty("prices").GetArrayLength().Should().Be(1);
        domainDetail.GetProperty("prices")[0].GetProperty("billingCycle").GetInt32()
            .Should().Be((int)BillingCycle.Yearly);

        _ = vpsCategoryId; // seeded for completeness
    }

    [Fact]
    public async Task ServiceCatalog_UnknownCategorySlug_ShouldReturn404()
    {
        Client.DefaultRequestHeaders.Authorization = null;

        var res = await Client.GetAsync("/api/categories/khong-ton-tai/plans");

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ServiceCatalog_InactivePlan_ShouldReturn404OnDetail()
    {
        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Test", Slug = "test-cat" };
        await AddEntityAsync(category);

        var plan = new ServicePlan(category.Id, "Inactive Plan", "1", "1", "1", "1", null);
        plan.Deactivate();
        await AddEntityAsync(plan);

        Client.DefaultRequestHeaders.Authorization = null;
        var res = await Client.GetAsync($"/api/service-plans/{plan.Id}");

        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ServiceCatalog_AddToCartWithoutAuth_ShouldReturn401()
    {
        var (vpsPlanId, _, _, _) = await SeedServiceCatalogAsync();

        Client.DefaultRequestHeaders.Authorization = null;
        var res = await Client.PostAsJsonAsync("/api/carts/items",
            new AddToCartCommand(vpsPlanId, BillingCycle.Monthly, 1));

        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private async Task<(Guid VpsPlanId, Guid HostingPlanId, Guid DomainPlanId, Guid VpsCategoryId)> SeedServiceCatalogAsync()
    {
        var vpsCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Cloud VPS", Slug = "cloud-vps" };
        var hostingCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Web Hosting", Slug = "web-hosting" };
        var domainCategory = new ServiceCategory { Id = Guid.NewGuid(), Name = "Tên miền", Slug = "ten-mien" };

        await AddEntityAsync(vpsCategory);
        await AddEntityAsync(hostingCategory);
        await AddEntityAsync(domainCategory);

        var vpsPlan = new ServicePlan(vpsCategory.Id, "Cloud VPS Pro", "8 Core", "16GB", "150GB NVMe", "Unlimited", null);
        var hostingPlan = new ServicePlan(hostingCategory.Id, "NVMe Pro", "2 Core", "2GB", "20GB NVMe", "Unlimited", null);
        var domainPlan = new ServicePlan(domainCategory.Id, "Tên miền .COM", null, null, null, null, null);

        await AddEntityAsync(vpsPlan);
        await AddEntityAsync(hostingPlan);
        await AddEntityAsync(domainPlan);

        await AddEntityAsync(new PlanPrice
        {
            Id = Guid.NewGuid(),
            ServicePlanId = vpsPlan.Id,
            BillingCycle = BillingCycle.Monthly,
            Price = 650_000,
            Currency = "VND",
            EffectiveFrom = DateTime.UtcNow.AddDays(-1)
        });
        await AddEntityAsync(new PlanPrice
        {
            Id = Guid.NewGuid(),
            ServicePlanId = vpsPlan.Id,
            BillingCycle = BillingCycle.Yearly,
            Price = 6_240_000,
            Currency = "VND",
            EffectiveFrom = DateTime.UtcNow.AddDays(-1)
        });
        await AddEntityAsync(new PlanPrice
        {
            Id = Guid.NewGuid(),
            ServicePlanId = hostingPlan.Id,
            BillingCycle = BillingCycle.Monthly,
            Price = 89_000,
            Currency = "VND",
            EffectiveFrom = DateTime.UtcNow.AddDays(-1)
        });
        await AddEntityAsync(new PlanPrice
        {
            Id = Guid.NewGuid(),
            ServicePlanId = hostingPlan.Id,
            BillingCycle = BillingCycle.Yearly,
            Price = 801_000,
            Currency = "VND",
            EffectiveFrom = DateTime.UtcNow.AddDays(-1)
        });
        await AddEntityAsync(new PlanPrice
        {
            Id = Guid.NewGuid(),
            ServicePlanId = domainPlan.Id,
            BillingCycle = BillingCycle.Yearly,
            Price = 250_000,
            Currency = "VND",
            EffectiveFrom = DateTime.UtcNow.AddDays(-1)
        });

        await AddEntityAsync(new Promotion
        {
            Id = Guid.NewGuid(),
            ServicePlanId = vpsPlan.Id,
            DiscountPercent = 15,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(30)
        });

        return (vpsPlan.Id, hostingPlan.Id, domainPlan.Id, vpsCategory.Id);
    }
}
