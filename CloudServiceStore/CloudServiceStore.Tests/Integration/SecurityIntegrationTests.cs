using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class SecurityIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public SecurityIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }
    [Fact]
    public async Task Manage_Security_ShouldSucceed()
    {
        // 1. Seed Customer and Sessions/Logins
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        AuthenticateCustomer();

        var login = new LoginHistory
        {
            Id = Guid.NewGuid(),
            UserId = customerId,
            IpAddress = "127.0.0.1",
            UserAgent = "TestAgent",
            IsSuccess = true,
            LoginAt = DateTime.UtcNow
        };
        await AddEntityAsync(login);

        var sessionId = Guid.NewGuid();
        var session = new UserSession
        {
            Id = sessionId,
            UserId = customerId,
            DeviceInfo = "TestDevice",
            RefreshTokenHash = "hash",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };
        await AddEntityAsync(session);

        // 2. Get Login History
        var loginResponse = await Client.GetAsync("/api/security/login-history");
        loginResponse.EnsureSuccessStatusCode();
        var logins = await loginResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        logins.GetArrayLength().Should().BeGreaterThan(0);

        // 3. Get Sessions
        var sessionResponse = await Client.GetAsync("/api/security/sessions");
        sessionResponse.EnsureSuccessStatusCode();
        var sessions = await sessionResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        sessions.GetArrayLength().Should().BeGreaterThan(0);

        // 4. Revoke Session
        var revokeResponse = await Client.DeleteAsync($"/api/security/sessions/{sessionId}");
        revokeResponse.EnsureSuccessStatusCode();

        // 5. Verify Revoked
        var verifyResponse = await Client.GetAsync("/api/security/sessions");
        var verifySessions = await verifyResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        
        bool isRevokedFound = false;
        foreach (var s in verifySessions.EnumerateArray())
        {
            if (s.GetProperty("id").GetGuid() == sessionId && s.GetProperty("isRevoked").GetBoolean())
            {
                isRevokedFound = true;
            }
        }
        isRevokedFound.Should().BeTrue();
    }
}
