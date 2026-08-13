using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ApiKeys.Commands.GenerateApiKey;
using CloudServiceStore.Application.Features.NotificationSettings.Commands.UpdateNotificationSetting;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class SecurityPreferencesE2ETests : BaseE2ETest
{
    public SecurityPreferencesE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Security_And_Preferences_Workflow_ShouldWorkCorrectly()
    {
        // 1. Customer Logs in
        var customerToken = await RegisterAndLoginCustomerAsync("cust_security@test.com", "Cust@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);

        // 2. Generate API Key
        var generateKeyCmd = new GenerateApiKeyCommand("read,write");
        var keyRes = await Client.PostAsJsonAsync("/api/api-keys", generateKeyCmd);
        keyRes.EnsureSuccessStatusCode();

        // 3. Get API Keys
        var getKeysRes = await Client.GetAsync("/api/api-keys/me");
        getKeysRes.EnsureSuccessStatusCode();
        var keysStr = await getKeysRes.Content.ReadAsStringAsync();
        keysStr.Should().Contain("read,write");

        // We need the ApiKey Id to delete it, so we parse the JSON
        var keysJson = await getKeysRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var apiKeyId = keysJson[0].GetProperty("id").GetGuid();

        // 4. Revoke API Key
        var revokeKeyRes = await Client.DeleteAsync($"/api/api-keys/{apiKeyId}");
        revokeKeyRes.EnsureSuccessStatusCode();

        // 5. Get Login History
        var loginHistoryRes = await Client.GetAsync("/api/security/login-history");
        loginHistoryRes.EnsureSuccessStatusCode();
        var historyStr = await loginHistoryRes.Content.ReadAsStringAsync();
        historyStr.Should().Contain("127.0.0.1"); // Set in RegisterAndLoginCustomerAsync

        // 6. Get Sessions
        var sessionsRes = await Client.GetAsync("/api/security/sessions");
        sessionsRes.EnsureSuccessStatusCode();
        var sessionsJson = await sessionsRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        sessionsJson.GetArrayLength().Should().BeGreaterThan(0);
        var sessionId = sessionsJson[0].GetProperty("id").GetGuid();

        // 7. Revoke Session
        var revokeSessionRes = await Client.DeleteAsync($"/api/security/sessions/{sessionId}");
        revokeSessionRes.EnsureSuccessStatusCode();

        // 8. Update Notification Settings
        var updateNotifCmd = new UpdateNotificationSettingCommand(true, true, false);
        var updateNotifRes = await Client.PutAsJsonAsync("/api/notification-settings/me", updateNotifCmd);
        updateNotifRes.EnsureSuccessStatusCode();

        // 9. Get Notification Settings
        var getNotifRes = await Client.GetAsync("/api/notification-settings/me");
        getNotifRes.EnsureSuccessStatusCode();
        var notifStr = await getNotifRes.Content.ReadAsStringAsync();
        notifStr.Should().Contain("\"emailOnOrder\":true");
        notifStr.Should().Contain("\"emailOnPromotion\":false");
    }
}
