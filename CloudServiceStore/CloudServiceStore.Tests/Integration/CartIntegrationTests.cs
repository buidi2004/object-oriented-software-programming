using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class CartIntegrationTests : BaseIntegrationTest
{
    public CartIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task AddToCart_And_GetMyCart_ShouldSucceed()
    {
        AuthenticateCustomer();

        // 1. Arrange: Create a mock User
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(userId);
        
        // Wait, since we are using TestAuthHandler, we need to update it to use this Guid.
        var categoryId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Test Cat", Slug = "test-cat" });
        await AddEntityAsync(new ServicePlan(categoryId, "Test Plan", null, null, null, null, null) { Id = planId });
        await AddEntityAsync(new PlanPrice { ServicePlanId = planId, BillingCycle = BillingCycle.Monthly, Price = 100000, Currency = "VND", EffectiveFrom = DateTime.UtcNow });

        // 2. Act: Add to cart
        var command = new AddToCartCommand(planId, BillingCycle.Monthly, 1);
        var response = await Client.PostAsJsonAsync("/api/carts/items", command);
        response.EnsureSuccessStatusCode();

        // 3. Act: Get My Cart
        var getCartResponse = await Client.GetAsync("/api/carts/me");
        getCartResponse.EnsureSuccessStatusCode();
        var cartContent = await getCartResponse.Content.ReadAsStringAsync();

        // 4. Assert
        cartContent.Should().NotBeNullOrEmpty();
    }
}
