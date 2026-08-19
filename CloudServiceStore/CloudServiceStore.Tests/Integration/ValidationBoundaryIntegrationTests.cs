using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class ValidationBoundaryIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ValidationBoundaryIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public async Task AddToCart_WithInvalidQuantity_Returns400BadRequest(int quantity)
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/carts/items")
        {
            Content = JsonContent.Create(new AddToCartCommand(Guid.NewGuid(), BillingCycle.Monthly, quantity))
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().ContainEquivalentOf("Quantity");
    }

    [Fact]
    public async Task AddToCart_WithEmptyServicePlanId_Returns400BadRequest()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/carts/items")
        {
            Content = JsonContent.Create(new AddToCartCommand(Guid.Empty, BillingCycle.Monthly, 1))
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("")]
    [InlineData("@missinguser.com")]
    public async Task Register_WithInvalidEmail_Returns400BadRequest(string email)
    {
        // Arrange
        var cmd = new RegisterCommand("Test User", email, "ValidPass123!", null, null, null, null, null, null, null, null, null);

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", cmd);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().ContainEquivalentOf("Email");
    }

    [Theory]
    [InlineData("short1A")] // < 8 chars
    [InlineData("nouppercase123!")] // No uppercase
    [InlineData("NoDigitsInPassword!")] // No digits
    public async Task Register_WithWeakPassword_Returns400BadRequest(string weakPassword)
    {
        // Arrange
        var cmd = new RegisterCommand("Test User", $"test_{Guid.NewGuid():N}@example.com", weakPassword, null, null, null, null, null, null, null, null, null);

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", cmd);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().ContainEquivalentOf("Password");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(105)] // > 100%
    public async Task CreatePromotion_WithInvalidDiscountPercent_Returns400BadRequest(decimal discountPercent)
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/promotions")
        {
            Content = JsonContent.Create(new CreatePromotionCommand(Guid.NewGuid(), discountPercent, DateTime.UtcNow, DateTime.UtcNow.AddDays(7)))
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "admin");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().ContainEquivalentOf("DiscountPercent");
    }
}
