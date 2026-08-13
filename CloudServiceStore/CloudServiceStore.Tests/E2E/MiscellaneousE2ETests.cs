using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;
using CloudServiceStore.Application.Features.PaymentMethods.Commands.SavePaymentMethod;
using CloudServiceStore.Application.Features.Permissions.Commands.AssignPermissions;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class MiscellaneousE2ETests : BaseE2ETest
{
    public MiscellaneousE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Miscellaneous_Workflows_ShouldWorkCorrectly()
    {
        // 1. Setup Admin
        var adminToken = await RegisterAndLoginAdminAsync("admin_misc@test.com", "Admin@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 2. Abandoned Carts
        var abandonRes = await Client.PostAsync("/api/abandoned-carts/send-reminders", null);
        abandonRes.EnsureSuccessStatusCode();

        // 3. Audit Logs
        var auditRes = await Client.GetAsync("/api/audit-logs");
        auditRes.EnsureSuccessStatusCode();

        // 4. Exports
        var exportRes = await Client.GetAsync("/api/exports/orders?format=csv");
        exportRes.EnsureSuccessStatusCode();

        // 5. Jobs
        var jobsRes = await Client.PostAsync("/api/jobs/process-renewals", null);
        jobsRes.EnsureSuccessStatusCode();

        // 6. Permissions & Roles
        var getPermsRes = await Client.GetAsync("/api/permissions");
        getPermsRes.EnsureSuccessStatusCode();
        var permsJson = await getPermsRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        permsJson.GetArrayLength().Should().BeGreaterThan(0);

        var getRolesRes = await Client.GetAsync("/api/roles");
        getRolesRes.EnsureSuccessStatusCode();
        var rolesJson = await getRolesRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        rolesJson.GetArrayLength().Should().BeGreaterThan(0);

        var createRoleCmd = new CloudServiceStore.Application.Features.Roles.Commands.CreateRole.CreateRoleCommand("Moderator");
        var createRoleRes = await Client.PostAsJsonAsync("/api/roles", createRoleCmd);
        createRoleRes.EnsureSuccessStatusCode();
        var createdRoleJson = await createRoleRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var newRoleId = createdRoleJson.GetProperty("id").GetGuid();

        Guid adminRoleId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            adminRoleId = (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.Roles, r => r.Name == "Admin")).Id;
        }

        var permRes = await Client.GetAsync($"/api/roles/{adminRoleId}/permissions");
        permRes.EnsureSuccessStatusCode();

        var assignPermCmd = new AssignPermissionsToRoleCommand(adminRoleId, new List<Guid>());
        var assignRes = await Client.PutAsJsonAsync($"/api/roles/{adminRoleId}/permissions", assignPermCmd);
        assignRes.EnsureSuccessStatusCode();

        // 7. Setup Customer
        var customerToken = await RegisterAndLoginCustomerAsync("cust_misc@test.com", "Cust@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
        
        Guid customerId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            customerId = (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == "cust_misc@test.com")).Id;
        }

        // 8. Payment Methods
        var savePaymentCmd = new SavePaymentMethodCommand { Gateway = "Stripe", MaskedInfo = "**** 4242", IsDefault = true };
        var savePaymentRes = await Client.PostAsJsonAsync("/api/payment-methods", savePaymentCmd);
        savePaymentRes.EnsureSuccessStatusCode();
        var savePaymentJson = await savePaymentRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var paymentMethodId = savePaymentJson.GetProperty("id").GetGuid();

        var getPaymentRes = await Client.GetAsync("/api/payment-methods/me");
        getPaymentRes.EnsureSuccessStatusCode();

        var delPaymentRes = await Client.DeleteAsync($"/api/payment-methods/{paymentMethodId}");
        delPaymentRes.EnsureSuccessStatusCode();

        // 9. Gift Cards Setup & Redeem
        var wallet = new Wallet(customerId);
        await AddEntityAsync(wallet);

        var gcCode = "GC-TEST-" + Guid.NewGuid().ToString().Substring(0, 8);
        var gcId = Guid.NewGuid();
        await AddEntityAsync(new GiftCard { Id = gcId, Code = gcCode, Amount = 100, RemainingAmount = 100, ExpiryDate = DateTime.UtcNow.AddYears(1) });

        var gcBalanceRes = await Client.GetAsync($"/api/gift-cards/{gcCode}/balance");
        gcBalanceRes.EnsureSuccessStatusCode();

        var redeemCmd = new RedeemGiftCardCommand { Code = gcCode, AmountToRedeem = 50 };
        var redeemRes = await Client.PostAsJsonAsync("/api/gift-cards/redeem", redeemCmd);
        redeemRes.EnsureSuccessStatusCode();

        // 10. Public Endpoints
        Client.DefaultRequestHeaders.Authorization = null;
        var searchRes = await Client.GetAsync("/api/search?q=VPS");
        searchRes.EnsureSuccessStatusCode();

        var sitemapRes = await Client.GetAsync("/sitemap.xml");
        sitemapRes.EnsureSuccessStatusCode();

        var statusRes = await Client.GetAsync("/api/status");
        statusRes.EnsureSuccessStatusCode();
    }
}
