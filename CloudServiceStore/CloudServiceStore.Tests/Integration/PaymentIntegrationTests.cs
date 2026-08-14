using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Payments.Commands.CreatePayment;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class PaymentIntegrationTests : BaseIntegrationTest
{
    public PaymentIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreatePayment_ShouldReturnPaymentUrl()
    {
        AuthenticateCustomer();

        // 1. Arrange
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(userId);
        
        var categoryId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Cat", Slug = "cat" });
        await AddEntityAsync(new ServicePlan(categoryId, "Plan", null, null, null, null, null) { Id = planId });
        
        var orderId = Guid.NewGuid();
        
        // Seed an OrderRequest
        await AddEntityAsync(new OrderRequest(userId, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> { new CloudServiceStore.Domain.Entities.OrderItem(planId, BillingCycle.Monthly, 1, 150000m) }, null, 0, 150000m, false) { Id = orderId });

        // 2. Act
        var command = new CreatePaymentCommand(orderId);
        var response = await Client.PostAsJsonAsync("/api/payments", command);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var url = content.GetProperty("url").GetString();

        // 3. Assert
        url.Should().NotBeNullOrEmpty();
        url.Should().Contain("vnpay"); // assuming it mocks or returns a URL with vnpay
    }
}
