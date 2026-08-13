using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class LiveSupportE2ETests : BaseE2ETest
{
    public LiveSupportE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Live_Support_Workflow_ShouldWorkCorrectly()
    {
        // 1. Customer Logs in
        var customerToken = await RegisterAndLoginCustomerAsync("cust_live@test.com", "Cust@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);

        // 2. Start Chat Session
        var startRes = await Client.PostAsync("/api/chats", null);
        startRes.EnsureSuccessStatusCode();
        var startJson = await startRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var sessionId = startJson.GetProperty("id").GetGuid();

        // 3. Send Message
        // For [FromBody] string, we should send it as JSON string.
        var msgRes = await Client.PostAsJsonAsync($"/api/chats/{sessionId}/messages", "Hello, I need help!");
        msgRes.EnsureSuccessStatusCode();

        // 4. Admin Logs in
        var adminToken = await RegisterAndLoginAdminAsync("admin_live@test.com", "Admin@123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 5. Admin sends reply
        var replyRes = await Client.PostAsJsonAsync($"/api/chats/{sessionId}/messages", "Hi, how can I assist you?");
        replyRes.EnsureSuccessStatusCode();

        // 6. Get Messages (Must be customer)
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
        var getMsgsRes = await Client.GetAsync($"/api/chats/{sessionId}/messages");
        getMsgsRes.EnsureSuccessStatusCode();
        var msgsStr = await getMsgsRes.Content.ReadAsStringAsync();
        msgsStr.Should().Contain("Hello, I need help!");
        msgsStr.Should().Contain("Hi, how can I assist you?");

        // 6.5 Customer checks their active chats
        var myActiveRes = await Client.GetAsync("/api/chats/my-active");
        myActiveRes.EnsureSuccessStatusCode();
        var myActiveJson = await myActiveRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        myActiveJson.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);

        // 6.6 Admin checks active chats
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var activeRes = await Client.GetAsync("/api/chats/active");
        activeRes.EnsureSuccessStatusCode();
        var activeJson = await activeRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        activeJson.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);

        // 7. Close Session
        var closeRes = await Client.PatchAsync($"/api/chats/{sessionId}/close", null);
        closeRes.EnsureSuccessStatusCode();
    }
}
