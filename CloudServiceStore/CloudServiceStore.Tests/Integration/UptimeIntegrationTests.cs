using System;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class UptimeIntegrationTests : BaseIntegrationTest
{
    public UptimeIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task GetOrderUptime_ShouldReturnLogs()
    {
        // 1. Arrange Customer
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        AuthenticateCustomer();

        // Ensure ServicePlan and Order exists
        var servicePlanId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var category = new CloudServiceStore.Domain.Entities.ServiceCategory { Id = categoryId, Name = "Hosting", Slug = "hosting" };
        await AddEntityAsync(category);

        var servicePlan = new CloudServiceStore.Domain.Entities.ServicePlan(categoryId, "Plan 1", "1 Core", "1GB", "10GB", "1TB", null);
        servicePlan.Id = servicePlanId;
        await AddEntityAsync(servicePlan);

        var orderId = Guid.NewGuid();
        var order = new CloudServiceStore.Domain.Entities.OrderRequest(
            customerId, 
            servicePlanId, 
            CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 
            null, 
            0, 
            100);
        order.Id = orderId;
        order.Pay();
        await AddEntityAsync(order);

        var log = new CloudServiceStore.Domain.Entities.ServiceStatusLog
        {
            Id = Guid.NewGuid(),
            OrderRequestId = orderId,
            IsUp = true,
            CheckedAt = DateTime.UtcNow
        };
        await AddEntityAsync(log);

        // 2. Act
        var getResponse = await Client.GetAsync($"/api/orders/{orderId}/uptime");
        
        // 3. Assert
        getResponse.EnsureSuccessStatusCode();
        var getContent = await getResponse.Content.ReadAsStringAsync();
        getContent.Should().Contain("true");
    }
}
