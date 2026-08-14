using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Loyalty.Commands.RedeemLoyalty;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class LoyaltyIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public LoyaltyIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetMyLoyalty_ShouldReturnPoints()
    {
        AuthenticateCustomer();
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        
        var loyalty = new LoyaltyPoint { Id = Guid.NewGuid(), UserId = customerId, Points = 500 };
        await AddEntityAsync(loyalty);

        var response = await Client.GetAsync("/api/loyalty/me");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<LoyaltyPoint>();
        result.Should().NotBeNull();
        result.Points.Should().Be(500);
    }

    [Fact]
    public async Task RedeemLoyalty_ShouldSucceed()
    {
        AuthenticateCustomer();
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        
        var loyalty = new LoyaltyPoint { Id = Guid.NewGuid(), UserId = customerId, Points = 1000 };
        await AddEntityAsync(loyalty);

        var command = new RedeemLoyaltyCommand { PointsToRedeem = 500 };
        var response = await Client.PostAsJsonAsync("/api/loyalty/redeem", command);
        response.EnsureSuccessStatusCode();
    }
}
