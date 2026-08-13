using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using CloudServiceStore.Application.Features.Wallet.Commands.TopUpWallet;
using CloudServiceStore.Application.Features.Wallet.Commands.PayWithWallet;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class CustomerJourneyE2ETests : BaseE2ETest
{
    public CustomerJourneyE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task CompleteCustomerJourney_ShouldSucceed()
    {
        // 1. Setup Data
        var category = new ServiceCategory();
        category.Id = Guid.NewGuid();
        category.Name = "Cloud Server";
        category.Slug = "cloud-server";
        await AddEntityAsync(category);

        var plan = new ServicePlan(category.Id, "VPS Basic", "1", "1", "10", "100", null);
        var planPrice = new PlanPrice();
        planPrice.Id = Guid.NewGuid();
        planPrice.ServicePlanId = plan.Id;
        planPrice.BillingCycle = BillingCycle.Monthly;
        planPrice.Price = 100m;
        plan.AddPrice(planPrice);
        await AddEntityAsync(plan);

        var coupon = new Coupon("DISCOUNT10", 10m, 100, DateTime.UtcNow.AddDays(10));
        await AddEntityAsync(coupon);

        // 2. Register and Login
        var token = await RegisterAndLoginCustomerAsync("customer_journey@test.com", "Password123!");
        token.Should().NotBeNullOrEmpty();

        // 3. Top-up Wallet
        var topUpCommand = new TopUpWalletCommand(500m); // Top up $500
        var topUpResponse = await Client.PostAsJsonAsync("/api/wallet/top-up", topUpCommand);
        if (!topUpResponse.IsSuccessStatusCode)
        {
            var err = await topUpResponse.Content.ReadAsStringAsync();
            throw new Exception($"TopUp failed: {err}");
        }

        // 4. Add to Cart
        var addToCartCommand = new AddToCartCommand(plan.Id, BillingCycle.Monthly, 1);
        var addToCartResponse = await Client.PostAsJsonAsync("/api/carts/items", addToCartCommand);
        addToCartResponse.EnsureSuccessStatusCode();

        // 4.1 Get Cart
        var cartRes = await Client.GetAsync("/api/carts/me");
        cartRes.EnsureSuccessStatusCode();
        var cartJson = await cartRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var cartItem = cartJson.GetProperty("items")[0];
        var cartItemId = cartItem.GetProperty("id").GetGuid();

        // 4.2 Update Cart Item
        var updateItemCommand = new CloudServiceStore.Application.Features.Carts.Commands.UpdateCartItem.UpdateCartItemCommand(cartItemId, 2);
        var updateItemRes = await Client.PutAsJsonAsync($"/api/carts/items/{cartItemId}", updateItemCommand);
        updateItemRes.EnsureSuccessStatusCode();

        // 4.3 Delete Cart Item
        var deleteItemRes = await Client.DeleteAsync($"/api/carts/items/{cartItemId}");
        deleteItemRes.EnsureSuccessStatusCode();

        // 4.4 Add it back for checkout
        var addToCartCommand2 = new AddToCartCommand(plan.Id, BillingCycle.Monthly, 1);
        await Client.PostAsJsonAsync("/api/carts/items", addToCartCommand2);

        // 5. Apply Coupon - Wait, actually CheckoutCommand takes CouponCode.
        var checkoutCommand = new CheckoutCommand("DISCOUNT10");
        var checkoutResponse = await Client.PostAsJsonAsync("/api/orders/checkout", checkoutCommand);
        if (!checkoutResponse.IsSuccessStatusCode)
        {
            var err = await checkoutResponse.Content.ReadAsStringAsync();
            throw new Exception($"Checkout failed: {err}");
        }

        // The checkout response should contain the orderId
        var checkoutResult = await checkoutResponse.Content.ReadFromJsonAsync<CheckoutResultDto>();
        checkoutResult.Should().NotBeNull();
        checkoutResult!.OrderId.Should().NotBeEmpty();

        // 6. Pay with Wallet
        var payCommand = new PayWithWalletCommand(checkoutResult.OrderId);
        var payResponse = await Client.PostAsJsonAsync("/api/wallet/pay", payCommand);
        if (!payResponse.IsSuccessStatusCode)
        {
            var err = await payResponse.Content.ReadAsStringAsync();
            throw new Exception($"Pay failed: {err}");
        }
        
        // 7. Generate Invoice
        var generateInvoiceResponse = await Client.PostAsync($"/api/orders/{checkoutResult.OrderId}/invoice", null);
        generateInvoiceResponse.EnsureSuccessStatusCode();
        
        var invoiceResponse = await Client.GetAsync($"/api/orders/{checkoutResult.OrderId}/invoice");
        invoiceResponse.EnsureSuccessStatusCode();
        var invoiceResult = await invoiceResponse.Content.ReadFromJsonAsync<InvoiceDto>();
        
        // 8. Check Wallet Balance
        var walletMeResponse = await Client.GetAsync("/api/wallet/me");
        walletMeResponse.EnsureSuccessStatusCode();
        var walletJson = await walletMeResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        walletJson.GetProperty("balance").GetDecimal().Should().Be(500m - invoiceResult!.TotalAmount);

        // 9. Check Wallet Transactions
        var walletTxResponse = await Client.GetAsync("/api/wallet/transactions");
        walletTxResponse.EnsureSuccessStatusCode();
        var walletTxJson = await walletTxResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        walletTxJson.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);
    }

    private class CheckoutResultDto
    {
        public Guid OrderId { get; set; }
    }

    private class InvoiceDto
    {
        public Guid Id { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
