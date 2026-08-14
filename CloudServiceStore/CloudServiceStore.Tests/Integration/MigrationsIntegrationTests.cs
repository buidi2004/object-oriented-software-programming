using System;
using CloudServiceStore.Domain.Entities;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Migrations.Commands.CreateMigration;
using CloudServiceStore.Application.Features.Migrations.Commands.UpdateMigrationStatus;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class MigrationsIntegrationTests : BaseIntegrationTest
{
    public MigrationsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Create_And_ManageMigration_ShouldSucceed()
    {
        // 1. Arrange Customer
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        
        // Ensure ServicePlan and Order exists
        var servicePlanId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var category = new CloudServiceStore.Domain.Entities.ServiceCategory { Id = categoryId, Name = "Hosting", Slug = "hosting" };
        await AddEntityAsync(category);

        var servicePlan = new CloudServiceStore.Domain.Entities.ServicePlan(categoryId, "Plan 1", "1 Core", "1GB", "10GB", "1TB", null);
        servicePlan.Id = servicePlanId;
        await AddEntityAsync(servicePlan);

        var orderId = Guid.NewGuid();
        var orderItems = new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> { new CloudServiceStore.Domain.Entities.OrderItem(servicePlanId, CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 1, 100m) };
        var order = new OrderRequest(customerId, orderItems, null, 0, 100m, false);
        order.Id = orderId;
        order.Pay();
        await AddEntityAsync(order);

        // 2. Customer creates migration
        AuthenticateCustomer();
        var createCommand = new CreateMigrationCommand(orderId, "AWS", "Please migrate this ASAP");
        var createResponse = await Client.PostAsJsonAsync("/api/migration-requests", createCommand);
        createResponse.EnsureSuccessStatusCode();
        var createContent = await createResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var migrationId = createContent.GetProperty("migrationId").GetGuid();

        // 3. Admin updates status
        AuthenticateAdmin();
        var updateCommand = new UpdateMigrationStatusCommand(migrationId, MigrationStatus.Completed);
        var updateResponse = await Client.PatchAsJsonAsync($"/api/migration-requests/{migrationId}/status", updateCommand);
        updateResponse.EnsureSuccessStatusCode();

        // 4. Customer gets my migrations
        AuthenticateCustomer();
        var getResponse = await Client.GetAsync("/api/migration-requests/me");
        getResponse.EnsureSuccessStatusCode();
        var getContent = await getResponse.Content.ReadAsStringAsync();
        getContent.Should().Contain(migrationId.ToString());
        getContent.Should().Contain("\"status\":2");
    }
}
