using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using CloudServiceStore.Application.Features.ControlPanels.Commands.UpdateCredentials;
using CloudServiceStore.Application.Features.Migrations.Commands.CreateMigration;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ServiceOperationsE2ETests : BaseE2ETest
{
    public ServiceOperationsE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Service_Operations_Workflow_ShouldWorkCorrectly()
    {
        // 1. Setup Customer & Order
        var customerToken = await RegisterAndLoginCustomerAsync("cust_ops@test.com", "Cust@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
        
        Guid customerId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            customerId = (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == "cust_ops@test.com")).Id;
        }

        var categoryId = Guid.NewGuid();
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "VPS", Slug = "vps" });
        var planId = Guid.NewGuid();
        await AddEntityAsync(new ServicePlan { Id = planId, Name = "VPS Pro", CategoryId = categoryId, IsActive = true });
        
        var orderId = Guid.NewGuid();
        await AddEntityAsync(new OrderRequest 
        { 
            Id = orderId, 
            UserId = customerId, 
            ServicePlanId = planId, 
            Status = OrderStatus.Paid,
            CreatedAt = DateTime.UtcNow
        });

        // 2. Schedule Backup
        var backupCmd = new ScheduleBackupCommand(orderId, DateTime.UtcNow.AddDays(1));
        var backupRes = await Client.PostAsJsonAsync($"/api/orders/{orderId}/backups/schedule", backupCmd);
        backupRes.EnsureSuccessStatusCode();

        // 3. Toggle Auto-Renew
        var renewRes = await Client.PatchAsync($"/api/orders/{orderId}/auto-renew", null);
        renewRes.EnsureSuccessStatusCode();

        // 4. Create Migration Request
        var migrationCmd = new CreateMigrationCommand(orderId, "DigitalOcean", "Please migrate my site.");
        var migrationRes = await Client.PostAsJsonAsync("/api/migration-requests", migrationCmd);
        migrationRes.EnsureSuccessStatusCode();

        // 5. Setup Admin
        var adminToken = await RegisterAndLoginAdminAsync("admin_ops@test.com", "Admin@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 6. Update Control Panel Credentials
        var credentialsCmd = new UpdateControlPanelCredentialsCommand(orderId, "cPanel", "https://cpanel.domain.com:2083", "admin", "SecurePass!23");
        var panelRes = await Client.PutAsJsonAsync($"/api/orders/{orderId}/control-panel", credentialsCmd);
        panelRes.EnsureSuccessStatusCode();

        // 7. Verify Control Panel Credentials (as Admin)
        var getPanelRes = await Client.GetAsync($"/api/orders/{orderId}/control-panel");
        getPanelRes.EnsureSuccessStatusCode();
        var panelStr = await getPanelRes.Content.ReadAsStringAsync();
        panelStr.Should().Contain("cPanel");
        panelStr.Should().Contain("https://cpanel.domain.com:2083");
    }
}
