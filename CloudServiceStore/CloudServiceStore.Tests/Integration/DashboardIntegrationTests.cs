using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class DashboardIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public DashboardIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }
    [Fact]
    public async Task GetDashboard_Queries_ShouldSucceed_ForAppropriateRoles()
    {
        // 1. Seed Customer and Admin Data
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);


        // Seed some orders and payments to make sure queries don't crash
        var servicePlanId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var category = new ServiceCategory { Id = categoryId, Name = "Hosting", Slug = "hosting" };
        await AddEntityAsync(category);

        var servicePlan = new ServicePlan(categoryId, "Plan 1", "1 Core", "1GB", "10GB", "1TB", null);
        servicePlan.Id = servicePlanId;
        await AddEntityAsync(servicePlan);

        var orderId = Guid.NewGuid();
        var order = new OrderRequest(
            customerId, 
            servicePlanId, 
            CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 
            null, 
            0, 
            100);
        order.Id = orderId;
        order.Pay();
        await AddEntityAsync(order);

        // 2. Customer gets MyDashboard
        AuthenticateCustomer();
        var customerDashboardResponse = await Client.GetAsync("/api/dashboard/me");
        customerDashboardResponse.EnsureSuccessStatusCode();

        var adminRevenueFail = await Client.GetAsync("/api/dashboard/revenue-stats?startDate=2020-01-01&endDate=2030-01-01");
        adminRevenueFail.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 3. Admin gets RevenueStats and OrderTrend
        AuthenticateAdmin();
        
        var customerDashboardFail = await Client.GetAsync("/api/dashboard/me");
        customerDashboardFail.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var adminRevenueResponse = await Client.GetAsync($"/api/dashboard/revenue-stats?startDate={DateTime.UtcNow.AddDays(-1):yyyy-MM-dd}&endDate={DateTime.UtcNow.AddDays(1):yyyy-MM-dd}");
        adminRevenueResponse.EnsureSuccessStatusCode();

        var adminTrendResponse = await Client.GetAsync($"/api/dashboard/order-trend?startDate={DateTime.UtcNow.AddDays(-1):yyyy-MM-dd}&endDate={DateTime.UtcNow.AddDays(1):yyyy-MM-dd}");
        adminTrendResponse.EnsureSuccessStatusCode();
    }
}
