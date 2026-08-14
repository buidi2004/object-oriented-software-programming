using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Coupons.Commands.CreateCoupon;
using CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Tests.Integration;

public class CouponsIntegrationTests : BaseIntegrationTest
{
    public CouponsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Create_And_ApplyCoupon_ShouldSucceed()
    {
        // 1. Arrange User and OrderRequest
        var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(userId);

        var orderId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Cat C", Slug = "cat-c" });
        await AddEntityAsync(new ServicePlan(categoryId, "Plan C", null, null, null, null, null) { Id = planId });
        await AddEntityAsync(new OrderRequest(userId, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> { new CloudServiceStore.Domain.Entities.OrderItem(planId, BillingCycle.Monthly, 1, 150000m) }, null, 0, 150000m, false) { Id = orderId });

        // 2. Act: Admin creates Coupon
        AuthenticateAdmin();
        var createCommand = new CreateCouponCommand("TEST10", 10m, 100, DateTime.UtcNow.AddDays(10), true);
        var createResponse = await Client.PostAsJsonAsync("/api/coupons", createCommand);
        createResponse.EnsureSuccessStatusCode();

        // 3. Act: Customer applies Coupon
        AuthenticateCustomer();
        var applyCommand = new ApplyCouponCommand(orderId, "TEST10");
        var applyResponse = await Client.PostAsJsonAsync("/api/coupons/apply", applyCommand);
        applyResponse.EnsureSuccessStatusCode();

        // 4. Assert
        var applyContent = await applyResponse.Content.ReadAsStringAsync();
        applyContent.Should().Contain("true");
        
        // Ensure the order's discount is applied
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            var updatedOrder = await db.OrderRequests.FindAsync(orderId);
            updatedOrder!.DiscountAmount.Should().BeGreaterThan(0);
        }
    }
}
