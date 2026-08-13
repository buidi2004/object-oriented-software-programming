using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using Microsoft.Extensions.DependencyInjection;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class AdminE2ETests : BaseE2ETest
{
    public AdminE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task AdminManagement_Workflow_ShouldWorkCorrectly()
    {
        // 1. Admin Login
        var adminToken = await RegisterAndLoginAdminAsync("admin_management@test.com", "Admin@123");
        SetAuthToken(adminToken);

        // 2. Create Service Category
        var createCatCmd = new CreateCategoryCommand("Database Servers", "db-servers");
        var catRes = await Client.PostAsJsonAsync("/api/categories", createCatCmd);
        catRes.EnsureSuccessStatusCode();
        var catId = await catRes.Content.ReadFromJsonAsync<Guid>();

        // 3. Create Service Plan
        var createPlanCmd = new CreateServicePlanCommand(catId, "MySQL Basic", "2GB RAM", "100GB", "1", "http://qr.com", true);
        var planRes = await Client.PostAsJsonAsync("/api/service-plans", createPlanCmd);
        planRes.EnsureSuccessStatusCode();
        var planJson = await planRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var planId = planJson.GetProperty("id").GetGuid();

        // 4. Create Promotion
        var createPromoCmd = new CreatePromotionCommand(planId, 15, DateTime.UtcNow.AddDays(-1), DateTime.UtcNow.AddDays(10));
        var promoRes = await Client.PostAsJsonAsync("/api/promotions", createPromoCmd);
        promoRes.EnsureSuccessStatusCode();

        // 5. Setup Customer and Lock it
        var custToken = await RegisterAndLoginCustomerAsync("bad_customer@test.com", "Cust@123");
        SetAuthToken(adminToken); // switch back to admin

        // Wait, how do I get the customer ID to lock them?
        var meRes = await Client.GetAsync("/api/security/sessions"); // Or something to get me?
        // Let's query DB for custId
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
        var custUser = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(db.AppUsers, u => u.Email == "bad_customer@test.com");
        var custId = custUser!.Id;

        var lockRes = await Client.PatchAsync($"/api/users/{custId}/lock", null);
        lockRes.EnsureSuccessStatusCode();

        // Verify locked user cannot login
        var loginCommand = new CloudServiceStore.Application.Features.Auth.Commands.Login.LoginCommand("bad_customer@test.com", "Cust@123", "127.0.0.1", "E2E Test", "Test Device");
        var loginRes = await Client.PostAsJsonAsync("/api/auth/login", loginCommand);
        loginRes.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        var problemDetails = await loginRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var detail = problemDetails.GetProperty("detail").GetString();
        detail.Should().Contain("bị khóa");

        // 6. View Dashboard Revenue Stats
        SetAuthToken(adminToken);
        var statsRes = await Client.GetAsync("/api/dashboard/revenue-stats");
        statsRes.EnsureSuccessStatusCode();
        var stats = await statsRes.Content.ReadAsStringAsync();
        stats.Should().NotBeNullOrEmpty();

        // 7. List Users
        var usersRes = await Client.GetAsync("/api/users");
        usersRes.EnsureSuccessStatusCode();
        var usersJson = await usersRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        usersJson.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);

        // 8. Change User Role
        // Let's create a role or fetch existing non-admin role
        Guid roleId;
        using (var scope2 = Factory.Services.CreateScope())
        {
            var db2 = scope2.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            var role = new CloudServiceStore.Domain.Entities.Role { Name = "Manager" };
            db2.Roles.Add(role);
            await db2.SaveChangesAsync();
            roleId = role.Id;
        }

        var changeRoleCmd = new CloudServiceStore.Application.Features.Users.Commands.ChangeRole.ChangeUserRoleCommand(custId, "Manager");
        var changeRoleRes = await Client.PatchAsJsonAsync($"/api/users/{custId}/role", changeRoleCmd);
        changeRoleRes.EnsureSuccessStatusCode();

        // 9. View Abandoned Carts
        var abandonedRes = await Client.GetAsync("/api/carts/abandoned");
        abandonedRes.EnsureSuccessStatusCode();
        var abandonedJson = await abandonedRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        abandonedJson.TryGetProperty("items", out _).Should().BeTrue();
    }
}
