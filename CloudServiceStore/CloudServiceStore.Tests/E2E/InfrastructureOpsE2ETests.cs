using System;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AutoRenew.Commands.ToggleAutoRenew;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.ControlPanels.Commands.UpdateCredentials;
using CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;
using CloudServiceStore.Application.Features.Coupons.Commands.CreateCoupon;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class InfrastructureOpsE2ETests : BaseE2ETest
{
    public InfrastructureOpsE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    /// <summary>
    /// Helper: Register customer, get their real DB UserId, create Category+Plan+Order, return (token, orderId).
    /// This avoids FK violations by using the real UserId from AppUsers table.
    /// </summary>
    private async Task<(string Token, Guid OrderId, Guid UserId)> SetupCustomerWithOrderAsync(string emailPrefix)
    {
        var email = $"{emailPrefix}_{Guid.NewGuid():N}@test.com";
        var token = await RegisterAndLoginCustomerAsync(email, "Cust@123!");

        // Get actual user ID from DB
        Guid userId;
        Guid orderId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = db.AppUsers.First(u => u.Email == email);
            userId = user.Id;

            // Create category + plan + order in one transaction
            var category = new ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = $"Cat-{emailPrefix}",
                Slug = $"cat-{Guid.NewGuid():N}"
            };
            db.ServiceCategories.Add(category);

            var plan = new ServicePlan(category.Id, $"Plan-{emailPrefix}", "1", "1", "10", "100", null);
            db.ServicePlans.Add(plan);

            var order = new OrderRequest(userId, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> { new CloudServiceStore.Domain.Entities.OrderItem(plan.Id, BillingCycle.Monthly, 1, 100m) }, null, 0, 100m, false);
            db.OrderRequests.Add(order);

            await db.SaveChangesAsync();
            orderId = order.Id;
        }

        return (token, orderId, userId);
    }

    // ========================================================================
    // 1. BACKUP FLOW: Schedule + Get Backups
    // ========================================================================

    [Fact]
    public async Task Backup_ScheduleAndRetrieve_ShouldWork()
    {
        var email = $"backup_{Guid.NewGuid():N}@test.com";
        var token = await RegisterAndLoginCustomerAsync(email, "Cust@123!");
        SetAuthToken(token);

        // Create order with Paid status (backup requires paid order)
        Guid orderId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = db.AppUsers.First(u => u.Email == email);

            var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Backup Cat", Slug = $"backup-{Guid.NewGuid():N}" };
            db.ServiceCategories.Add(category);
            var plan = new ServicePlan(category.Id, "Backup Plan", "1", "1", "10", "100", null);
            db.ServicePlans.Add(plan);
            var order = new OrderRequest(user.Id, new System.Collections.Generic.List<CloudServiceStore.Domain.Entities.OrderItem> { new CloudServiceStore.Domain.Entities.OrderItem(plan.Id, BillingCycle.Monthly, 1, 100m) }, null, 0, 100m, false);
            order.Pay(); // Mark as Paid
            db.OrderRequests.Add(order);
            await db.SaveChangesAsync();
            orderId = order.Id;
        }

        // Schedule a backup
        var scheduleCmd = new ScheduleBackupCommand(orderId, DateTime.UtcNow.AddHours(1));
        var scheduleRes = await Client.PostAsJsonAsync("/api/backups/schedule", scheduleCmd);
        scheduleRes.EnsureSuccessStatusCode();
        var scheduleResult = await scheduleRes.Content.ReadFromJsonAsync<JsonElement>();
        scheduleResult.GetProperty("backupId").GetGuid().Should().NotBeEmpty();

        // Get backups for this order
        var getRes = await Client.GetAsync($"/api/backups/{orderId}");
        getRes.EnsureSuccessStatusCode();
    }

    // ========================================================================
    // 2. UPTIME FLOW: System Status (public) + Order Uptime (auth)
    // ========================================================================

    [Fact]
    public async Task Uptime_SystemStatusAndOrderUptime_ShouldWork()
    {
        // GET /api/uptime/system (public, no auth needed)
        Client.DefaultRequestHeaders.Authorization = null;
        var systemRes = await Client.GetAsync("/api/uptime/system");
        systemRes.EnsureSuccessStatusCode();

        // Create a customer with order for per-order uptime
        var (token, orderId, _) = await SetupCustomerWithOrderAsync("uptime");
        SetAuthToken(token);

        // GET /api/uptime/order/{orderId} (auth)
        var orderUptimeRes = await Client.GetAsync($"/api/uptime/order/{orderId}");
        orderUptimeRes.EnsureSuccessStatusCode();
    }

    // ========================================================================
    // 3. AUTO-RENEW FLOW: Toggle on/off
    // ========================================================================

    [Fact]
    public async Task AutoRenew_Toggle_ShouldReturnNoContent()
    {
        var (token, orderId, _) = await SetupCustomerWithOrderAsync("autorenew");
        SetAuthToken(token);

        // Toggle auto-renew ON
        var toggleCmd = new ToggleAutoRenewCommand(orderId);
        var toggleRes = await Client.PutAsJsonAsync("/api/auto-renew/toggle", toggleCmd);
        toggleRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Toggle auto-renew OFF (toggle again)
        var toggleRes2 = await Client.PutAsJsonAsync("/api/auto-renew/toggle", toggleCmd);
        toggleRes2.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // ========================================================================
    // 4. COUPON CRUD FLOW: Admin create + list, Customer apply
    // ========================================================================

    [Fact]
    public async Task Coupon_CreateListAndApply_ShouldWork()
    {
        // Admin creates a coupon
        var adminToken = await RegisterAndLoginAdminAsync($"admin_coupon_{Guid.NewGuid():N}@test.com", "Admin@123!");
        SetAuthToken(adminToken);

        var couponCode = $"SAVE{Guid.NewGuid():N}"[..16];
        var createCmd = new CreateCouponCommand(couponCode, 20m, 100, DateTime.UtcNow.AddDays(30), true);
        var createRes = await Client.PostAsJsonAsync("/api/coupons", createCmd);
        createRes.EnsureSuccessStatusCode();

        // Admin lists all coupons
        var listRes = await Client.GetAsync("/api/coupons");
        listRes.EnsureSuccessStatusCode();
        var couponsJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();
        couponsJson.GetArrayLength().Should().BeGreaterThanOrEqualTo(1);

        // Customer applies coupon to their order
        var (customerToken, orderId, _) = await SetupCustomerWithOrderAsync("coupon");
        SetAuthToken(customerToken);

        var applyCmd = new ApplyCouponCommand(orderId, couponCode);
        var applyRes = await Client.PostAsJsonAsync("/api/coupons/apply", applyCmd);
        applyRes.EnsureSuccessStatusCode();
    }

    // ========================================================================
    // 5. CONTROL PANEL FLOW: Update + Get credentials
    // ========================================================================

    [Fact]
    public async Task ControlPanel_UpdateAndGetCredentials_ShouldWork()
    {
        var (token, orderId, _) = await SetupCustomerWithOrderAsync("cpanel");
        SetAuthToken(token);

        // Update control panel credentials
        var updateCmd = new UpdateControlPanelCredentialsCommand(
            orderId,
            "cPanel",
            "https://cpanel.example.com:2083",
            "admin_user",
            "secure_p@ssw0rd"
        );
        var updateRes = await Client.PutAsJsonAsync($"/api/orders/{orderId}/control-panel", updateCmd);
        updateRes.EnsureSuccessStatusCode();

        // Get control panel credentials
        var getRes = await Client.GetAsync($"/api/orders/{orderId}/control-panel");
        getRes.EnsureSuccessStatusCode();
    }

    // ========================================================================
    // 6. SITEMAP FLOW: GET sitemap.xml returns valid XML
    // ========================================================================

    [Fact]
    public async Task Sitemap_GetSitemapXml_ShouldReturnXml()
    {
        // GET /sitemap.xml (public endpoint, no auth)
        Client.DefaultRequestHeaders.Authorization = null;
        var sitemapRes = await Client.GetAsync("/sitemap.xml");
        sitemapRes.EnsureSuccessStatusCode();

        // Assert content type is XML
        sitemapRes.Content.Headers.ContentType!.MediaType.Should().Be("application/xml");

        // Assert response body contains XML structure
        var body = await sitemapRes.Content.ReadAsStringAsync();
        body.Should().Contain("<?xml");
        body.Should().Contain("urlset");
    }

    // ========================================================================
    // 7. CATEGORY & PLAN SEO FLOW: Delete Category, Update Plan SEO
    // ========================================================================

    [Fact]
    public async Task CategoryAndPlan_SeoAndDeletion_ShouldWork()
    {
        // Admin logs in
        var adminToken = await RegisterAndLoginAdminAsync($"admin_seo_{Guid.NewGuid():N}@test.com", "Admin@123!");
        SetAuthToken(adminToken);

        // Create a Category
        var createCatCmd = new CreateCategoryCommand("Cat to Delete", "cat-delete");
        var catRes = await Client.PostAsJsonAsync("/api/categories", createCatCmd);
        catRes.EnsureSuccessStatusCode();
        var catId = await catRes.Content.ReadFromJsonAsync<Guid>();

        // Delete Category
        var delCatRes = await Client.DeleteAsync($"/api/categories/{catId}");
        delCatRes.EnsureSuccessStatusCode();

        // Create a Plan to test SEO
        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "Seo Cat", Slug = $"seo-{Guid.NewGuid():N}" };
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.ServiceCategories.Add(category);
            await db.SaveChangesAsync();
        }

        var createPlanCmd = new CreateServicePlanCommand(category.Id, "SEO Plan", "1", "1", "10", "100", true);
        var planRes = await Client.PostAsJsonAsync("/api/service-plans", createPlanCmd);
        planRes.EnsureSuccessStatusCode();
        var planJson = await planRes.Content.ReadFromJsonAsync<JsonElement>();
        var planId = planJson.GetProperty("id").GetGuid();

        // Update SEO
        var updateSeoCmd = new CloudServiceStore.Application.Features.ServicePlans.Commands.UpdateSeo.UpdateSeoCommand(
            planId, "New Title", "New Desc", "keys", "img.jpg");
        var seoRes = await Client.PutAsJsonAsync($"/api/service-plans/{planId}/seo", updateSeoCmd);
        seoRes.EnsureSuccessStatusCode();

        // Get SEO
        var getSeoRes = await Client.GetAsync($"/api/service-plans/{planId}/seo");
        getSeoRes.EnsureSuccessStatusCode();
        var seoResult = await getSeoRes.Content.ReadFromJsonAsync<JsonElement>();
        seoResult.GetProperty("metaTitle").GetString().Should().Be("New Title");
    }
}
