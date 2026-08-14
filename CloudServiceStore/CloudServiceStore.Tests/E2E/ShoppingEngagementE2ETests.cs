using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ExchangeRates.Commands.UpsertExchangeRate;
using CloudServiceStore.Application.Features.RecentlyViewed.Commands.RecordView;
using CloudServiceStore.Application.Features.Wishlists.Commands.AddToWishlist;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ShoppingEngagementE2ETests : BaseE2ETest
{
    public ShoppingEngagementE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Shopping_Engagement_Workflow_ShouldWorkCorrectly()
    {
        // 1. Setup Customer & Service Plan
        var customerToken = await RegisterAndLoginCustomerAsync("cust_shop@test.com", "Cust@123!");
        
        var categoryId = Guid.NewGuid();
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Web Hosting", Slug = "web-hosting" });
        var planId = Guid.NewGuid();
        await AddEntityAsync(new ServicePlan { Id = planId, Name = "Basic Hosting", CategoryId = categoryId, IsActive = true });

        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);

        // 2. Add to Wishlist
        var addWishlistCmd = new AddToWishlistCommand { ServicePlanId = planId };
        var wishlistRes = await Client.PostAsJsonAsync("/api/wishlist", addWishlistCmd);
        wishlistRes.EnsureSuccessStatusCode();
        var wishlistJson = await wishlistRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var wishlistId = wishlistJson.GetProperty("id").GetGuid();

        // 3. Get Wishlist
        var getWishlistRes = await Client.GetAsync("/api/wishlist/me");
        getWishlistRes.EnsureSuccessStatusCode();
        var getWishlistStr = await getWishlistRes.Content.ReadAsStringAsync();
        getWishlistStr.Should().Contain(planId.ToString());

        // 4. Remove from Wishlist
        var removeWishlistRes = await Client.DeleteAsync($"/api/wishlist/{wishlistId}");
        removeWishlistRes.EnsureSuccessStatusCode();

        // 5. Record Recently Viewed
        var recordViewCmd = new RecordViewCommand(planId);
        var recordRes = await Client.PostAsJsonAsync("/api/recently-viewed", recordViewCmd);
        recordRes.EnsureSuccessStatusCode();

        // 6. Get Recently Viewed
        var getRecentRes = await Client.GetAsync("/api/recently-viewed/me");
        getRecentRes.EnsureSuccessStatusCode();
        var getRecentStr = await getRecentRes.Content.ReadAsStringAsync();
        getRecentStr.Should().Contain(planId.ToString());

        // 7. Setup Admin for Exchange Rates
        var adminToken = await RegisterAndLoginAdminAsync("admin_shop@test.com", "Admin@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 8. Admin upserts Exchange Rate
        var upsertCmd = new UpsertExchangeRateCommand { FromCurrency = "USD", ToCurrency = "EUR", Rate = 0.9m };
        var upsertRes = await Client.PostAsJsonAsync("/api/exchange-rates", upsertCmd);
        upsertRes.EnsureSuccessStatusCode();

        // 9. Public gets Exchange Rates
        Client.DefaultRequestHeaders.Authorization = null;
        var getRatesRes = await Client.GetAsync("/api/exchange-rates");
        getRatesRes.EnsureSuccessStatusCode();
        var getRatesStr = await getRatesRes.Content.ReadAsStringAsync();
        getRatesStr.Should().Contain("USD");
        getRatesStr.Should().Contain("EUR");
        getRatesStr.Should().Contain("0.9");
    }
}
