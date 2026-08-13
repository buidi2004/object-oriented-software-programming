using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class BackupsIntegrationTests : BaseIntegrationTest
{
    public BackupsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Schedule_And_GetBackups_ShouldSucceed()
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

        // 2. Schedule Backup
        var scheduleCommand = new ScheduleBackupCommand(orderId, DateTime.UtcNow.AddDays(1));
        var scheduleResponse = await Client.PostAsJsonAsync($"/api/orders/{orderId}/backups/schedule", scheduleCommand);
        scheduleResponse.EnsureSuccessStatusCode();
        var scheduleContent = await scheduleResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var backupId = scheduleContent.GetProperty("backupId").GetGuid();

        // 3. Get Backups for Order
        var getResponse = await Client.GetAsync($"/api/orders/{orderId}/backups");
        getResponse.EnsureSuccessStatusCode();
        var getContent = await getResponse.Content.ReadAsStringAsync();
        getContent.Should().Contain(backupId.ToString());
    }
}
