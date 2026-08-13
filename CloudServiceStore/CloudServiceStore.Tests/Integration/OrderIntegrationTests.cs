using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class OrderIntegrationTests : BaseIntegrationTest
{
    public OrderIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Checkout_And_GenerateInvoice_ShouldSucceed()
    {
        AuthenticateCustomer();

        // 1. Arrange: Create Plan & Price
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(userId);

        var categoryId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Test Cat Order", Slug = "test-cat-order" });
        await AddEntityAsync(new ServicePlan(categoryId, "Test Plan Order", null, null, null, null, null) { Id = planId });
        await AddEntityAsync(new PlanPrice { ServicePlanId = planId, BillingCycle = BillingCycle.Monthly, Price = 250000m, Currency = "VND", EffectiveFrom = DateTime.UtcNow });

        // Add to Cart first
        var cartCommand = new AddToCartCommand(planId, BillingCycle.Monthly, 2);
        var cartResponse = await Client.PostAsJsonAsync("/api/carts/items", cartCommand);
        cartResponse.EnsureSuccessStatusCode();

        // 2. Act: Checkout
        var checkoutCommand = new CheckoutCommand(null);
        var checkoutResponse = await Client.PostAsJsonAsync("/api/orders/checkout", checkoutCommand);
        checkoutResponse.EnsureSuccessStatusCode();
        var checkoutContent = await checkoutResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var orderId = checkoutContent.GetProperty("orderId").GetGuid();

        // 3. Act: Mock Payment by updating order status
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            var order = await db.OrderRequests.FindAsync(orderId);
            order!.Pay();
            await db.SaveChangesAsync();
        }

        // 4. Act: Generate Invoice
        var invoiceResponse = await Client.PostAsync($"/api/orders/{orderId}/invoice", null);
        invoiceResponse.EnsureSuccessStatusCode();
        var invoiceContent = await invoiceResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var invoiceId = invoiceContent.GetProperty("invoiceId").GetGuid();

        // 5. Act: Get Invoice
        var getInvoiceResponse = await Client.GetAsync($"/api/orders/{orderId}/invoice");
        getInvoiceResponse.EnsureSuccessStatusCode();
        var getInvoiceContent = await getInvoiceResponse.Content.ReadAsStringAsync();

        // 5. Assert
        orderId.Should().NotBeEmpty();
        invoiceId.Should().NotBeEmpty();
        getInvoiceContent.Should().Contain(orderId.ToString());
        getInvoiceContent.Should().Contain("INV-");
    }
}
