using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class GiftCardsIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public GiftCardsIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetBalance_ShouldReturnAmount()
    {
        AuthenticateCustomer();
        var giftCard = new GiftCard { Id = Guid.NewGuid(), Code = "GIFT100", Amount = 100.0m, RemainingAmount = 100.0m, IsActive = true, ExpiryDate = DateTime.UtcNow.AddDays(30) };
        await AddEntityAsync(giftCard);

        var response = await Client.GetAsync($"/api/gift-cards/{giftCard.Code}/balance");
        response.EnsureSuccessStatusCode();

        var balance = await response.Content.ReadFromJsonAsync<CloudServiceStore.Application.DTOs.GiftCardBalanceDto>();
        balance.Should().NotBeNull();
        balance.RemainingAmount.Should().Be(100.0m);
    }

    [Fact]
    public async Task RedeemGiftCard_ShouldSucceed()
    {
        AuthenticateCustomer();
        var userId = Guid.NewGuid();
        await SeedUserAsync(userId);
        var giftCard = new GiftCard { Id = Guid.NewGuid(), Code = "REDEEM50", Amount = 50.0m, RemainingAmount = 50.0m, IsActive = true, ExpiryDate = DateTime.UtcNow.AddDays(30) };
        await AddEntityAsync(giftCard);

        var command = new RedeemGiftCardCommand { Code = "REDEEM50", AmountToRedeem = 50.0m };
        var response = await Client.PostAsJsonAsync("/api/gift-cards/redeem", command);
        response.EnsureSuccessStatusCode();
    }
}
