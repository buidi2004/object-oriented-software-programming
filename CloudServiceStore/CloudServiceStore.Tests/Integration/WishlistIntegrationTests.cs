using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Wishlists.Commands.AddToWishlist;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class WishlistIntegrationTests : BaseIntegrationTest
{
    public WishlistIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task AddToWishlist_And_GetMyWishlist_ShouldSucceed()
    {
        AuthenticateCustomer();

        // 1. Arrange
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(userId);

        var categoryId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Test Cat 2", Slug = "test-cat-2" });
        await AddEntityAsync(new ServicePlan(categoryId, "Test Plan 2", null, null, null, null, null) { Id = planId });

        // 2. Act: Add to wishlist
        var command = new AddToWishlistCommand { ServicePlanId = planId };
        var response = await Client.PostAsJsonAsync("/api/wishlist", command);
        response.EnsureSuccessStatusCode();

        // 3. Act: Get My Wishlist
        var getResponse = await Client.GetAsync("/api/wishlist/me");
        getResponse.EnsureSuccessStatusCode();
        var content = await getResponse.Content.ReadAsStringAsync();

        // 4. Assert
        content.Should().NotBeNullOrEmpty();
        content.Should().Contain(planId.ToString());
    }
}
