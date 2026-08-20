using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;
using CloudServiceStore.Application.Features.Payments.Commands.CreatePayment;
using CloudServiceStore.Application.Features.Wallet.Commands.PayWithWallet;
using CloudServiceStore.WebApi.Controllers;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class MoneyModulesExceptionMappingTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public MoneyModulesExceptionMappingTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetOrder_WithNonExistentId_Returns404NotFound()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/orders/{Guid.NewGuid()}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreatePayment_WithNonExistentOrderId_Returns404NotFound()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/payments")
        {
            Content = JsonContent.Create(new CreatePaymentCommand(Guid.NewGuid()))
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task PayWithWallet_WithInsufficientBalanceOrNonExistentOrder_Returns400BadRequest()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/wallet/pay")
        {
            Content = JsonContent.Create(new PayWithWalletCommand(Guid.NewGuid()))
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ApplyCoupon_NonExistent_Returns404NotFound()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/coupons/apply")
        {
            Content = JsonContent.Create(new ApplyCouponCommand(Guid.NewGuid(), $"NONEXISTENT_CODE_{Guid.NewGuid():N}"))
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetGiftCard_NonExistent_Returns404NotFound()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/gift-cards/balance/INVALID_CARD_{Guid.NewGuid():N}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateRefundRequest_NonExistentOrder_Returns404NotFound()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/orders/{Guid.NewGuid()}/refund-requests")
        {
            Content = JsonContent.Create(new CreateRefundRequestDto
            {
                Reason = "Wrong item",
                RefundAmount = 50000
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetRefundRequest_NonExistent_WithAdminToken_Returns404NotFound()
    {
        // Arrange
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/refund-requests/{Guid.NewGuid()}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "admin");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
