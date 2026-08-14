using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.SystemSettings.Commands.UpdateSetting;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class SystemReportsE2ETests : BaseE2ETest
{
    public SystemReportsE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task System_Reports_Workflow_ShouldWorkCorrectly()
    {
        // 1. Setup Customer & Order
        var customerToken = await RegisterAndLoginCustomerAsync("cust_sys@test.com", "Cust@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
        
        Guid customerId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            customerId = (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == "cust_sys@test.com")).Id;
        }

        var wallet = new Wallet(customerId);
        await AddEntityAsync(wallet);

        var orderId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "VPS", Slug = "vps" });
        var planId = Guid.NewGuid();
        await AddEntityAsync(new ServicePlan { Id = planId, Name = "VPS Pro", CategoryId = categoryId, IsActive = true });
        
        var orderItems = new System.Collections.Generic.List<OrderItem> { new OrderItem(planId, BillingCycle.Monthly, 1, 100m) };
        var order = new OrderRequest(customerId, orderItems, null, 0, 100m, false) { Id = orderId, Status = OrderStatus.Paid, CreatedAt = DateTime.UtcNow };
        await AddEntityAsync(order);

        // 2. Customer Creates Refund Request
        var refundReqDto = new { Reason = "Not satisfied", RefundAmount = 50.0m };
        var refundRes = await Client.PostAsJsonAsync($"/api/orders/{orderId}/refund-requests", refundReqDto);
        refundRes.EnsureSuccessStatusCode();
        var refundJson = await refundRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var refundId = refundJson.GetProperty("id").GetGuid();

        // 3. Setup Admin
        var adminToken = await RegisterAndLoginAdminAsync("admin_sys@test.com", "Admin@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 4. Admin Approves Refund Request
        var approveRes = await Client.PatchAsync($"/api/refund-requests/{refundId}/approve", null);
        approveRes.EnsureSuccessStatusCode();

        // 5. Admin Updates System Setting
        var updateSettingCmd = new UpdateSettingCommand("SiteName", "CloudServiceStore v2", "Name of the site");
        var updateSettingRes = await Client.PutAsJsonAsync("/api/settings/SiteName", updateSettingCmd);
        updateSettingRes.EnsureSuccessStatusCode();

        // 6. Public Views System Setting
        Client.DefaultRequestHeaders.Authorization = null;
        var getSettingRes = await Client.GetAsync("/api/settings/SiteName");
        getSettingRes.EnsureSuccessStatusCode();
        var getSettingStr = await getSettingRes.Content.ReadAsStringAsync();
        getSettingStr.Should().Contain("CloudServiceStore v2");
    }
}
