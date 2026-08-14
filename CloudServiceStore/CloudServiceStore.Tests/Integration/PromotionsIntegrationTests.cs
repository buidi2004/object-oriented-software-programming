using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class PromotionsIntegrationTests : BaseIntegrationTest
{
    public PromotionsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task CreatePromotion_And_GetAll_ShouldSucceed()
    {
        AuthenticateAdmin();

        var command = new CreatePromotionCommand(null, 15m, DateTime.UtcNow, DateTime.UtcNow.AddDays(10));

        var createResponse = await Client.PostAsJsonAsync("/api/promotions", command);
        createResponse.EnsureSuccessStatusCode();

        var getAllResponse = await Client.GetAsync("/api/promotions");
        getAllResponse.EnsureSuccessStatusCode();

        var getAllContent = await getAllResponse.Content.ReadAsStringAsync();
        getAllContent.Should().Contain("15");
    }
}
