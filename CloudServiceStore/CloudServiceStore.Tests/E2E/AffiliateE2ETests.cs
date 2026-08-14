using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Affiliates.Commands.CreateApplication;
using CloudServiceStore.Application.Features.Referrals.Commands.ApplyReferralCode;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;

namespace CloudServiceStore.Tests.E2E;

public class AffiliateE2ETests : BaseE2ETest
{
    public AffiliateE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task AffiliateAndReferral_Workflow_ShouldWorkCorrectly()
    {
        // 1. Customer 1 registers Affiliate
        var token1 = await RegisterAndLoginCustomerAsync("affiliate_cust1@test.com", "Cust@123");
        SetAuthToken(token1);

        var createApplicationCmd = new CreateAffiliateApplicationCommand("Test Affiliate Company", 10.0m);
        var applyRes = await Client.PostAsJsonAsync("/api/affiliate-applications", createApplicationCmd);
        applyRes.EnsureSuccessStatusCode();
        var appJson = await applyRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var appId = appJson.GetProperty("id").GetGuid();

        // 2. Admin approves Affiliate
        var adminToken = await RegisterAndLoginAdminAsync("admin_affiliate@test.com", "Admin@123");
        SetAuthToken(adminToken);

        var approveRes = await Client.PatchAsync($"/api/affiliate-applications/{appId}/approve", null);
        approveRes.EnsureSuccessStatusCode();

        // 3. Customer 1 gets Referral Code
        SetAuthToken(token1);
        var meRes = await Client.GetAsync("/api/referrals/me");
        meRes.EnsureSuccessStatusCode();
        
        var referralDto = await meRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        string referralCode = referralDto.GetProperty("code").GetString()!;
        referralCode.Should().NotBeNullOrEmpty();

        // 4. Customer 2 applies Referral Code
        var token2 = await RegisterAndLoginCustomerAsync("affiliate_cust2@test.com", "Cust@123");
        SetAuthToken(token2);

        var applyRefCmd = new ApplyReferralCodeCommand { Code = referralCode };
        var applyRefRes = await Client.PostAsJsonAsync("/api/referrals/apply", applyRefCmd);
        applyRefRes.EnsureSuccessStatusCode();
        var successResult = await applyRefRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        successResult.GetProperty("success").GetBoolean().Should().BeTrue();

        // 5. Customer 1 checks their affiliate applications
        SetAuthToken(token1);
        var appMeRes = await Client.GetAsync("/api/affiliate-applications/me");
        appMeRes.EnsureSuccessStatusCode();
        var appMeJson = await appMeRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        appMeJson.TryGetProperty("id", out _).Should().BeTrue();

        // 6. Customer 2 creates an application to be rejected
        var createRejectCmd = new CreateAffiliateApplicationCommand("Bad Company", 15.0m);
        var applyRejectRes = await Client.PostAsJsonAsync("/api/affiliate-applications", createRejectCmd);
        applyRejectRes.EnsureSuccessStatusCode();
        var appRejectJson = await applyRejectRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var rejectAppId = appRejectJson.GetProperty("id").GetGuid();

        // 7. Admin lists all applications and rejects Customer 2's application
        SetAuthToken(adminToken);
        
        var listAppsRes = await Client.GetAsync("/api/affiliate-applications");
        listAppsRes.EnsureSuccessStatusCode();
        var listAppsJson = await listAppsRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        GetItemsCount(listAppsJson).Should().BeGreaterThan(0);

        var rejectRes = await Client.PatchAsync($"/api/affiliate-applications/{rejectAppId}/reject", null);
        rejectRes.EnsureSuccessStatusCode();
    }
}
