using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Wallet.Commands.PayWithWallet;
using CloudServiceStore.Application.Features.Wallet.Commands.TopUpWallet;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class WalletIntegrationTests : BaseIntegrationTest
{
    public WalletIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task TopUpWallet_And_PayWithWallet_ShouldSucceed()
    {
        AuthenticateCustomer();

        // 1. Arrange: Create a Wallet and OrderRequest for the test user
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(userId);
        
        var categoryId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Cat", Slug = "cat2" });
        await AddEntityAsync(new ServicePlan(categoryId, "Plan", null, null, null, null, null) { Id = planId });
        
        var walletId = Guid.NewGuid();
        var orderId = Guid.NewGuid();

        await AddEntityAsync(new Wallet(userId) { Id = walletId });
        await AddEntityAsync(new OrderRequest(userId, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> { new CloudServiceStore.Domain.Entities.OrderItem(planId, BillingCycle.Monthly, 1, 150000m) }, null, 0, 150000m, false) { Id = orderId });

        // 2. Act: Top Up
        var topUpCommand = new TopUpWalletCommand(200000m);
        var topUpResponse = await Client.PostAsJsonAsync("/api/wallet/top-up", topUpCommand);
        topUpResponse.EnsureSuccessStatusCode();

        // 3. Act: Get Wallet
        var getWalletResponse = await Client.GetAsync("/api/wallet/me");
        getWalletResponse.EnsureSuccessStatusCode();
        var walletContent = await getWalletResponse.Content.ReadAsStringAsync();

        // 4. Act: Pay With Wallet
        var payCommand = new PayWithWalletCommand(orderId);
        var payResponse = await Client.PostAsJsonAsync("/api/wallet/pay", payCommand);
        payResponse.EnsureSuccessStatusCode();

        // 5. Assert
        walletContent.Should().Contain("200000"); // Before payment

        var getWalletAfterResponse = await Client.GetAsync("/api/wallet/me");
        var walletAfterContent = await getWalletAfterResponse.Content.ReadAsStringAsync();
        walletAfterContent.Should().Contain("50000"); // 200k - 150k
    }
}
