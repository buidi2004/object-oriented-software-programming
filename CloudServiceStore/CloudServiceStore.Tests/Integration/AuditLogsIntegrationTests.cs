using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class AuditLogsIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public AuditLogsIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }
    [Fact]
    public async Task GetAuditLogs_ShouldSucceed_ForAdmin()
    {
        // 1. Seed AuditLogs
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(adminId);
        
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = adminId,
            Action = CloudServiceStore.Domain.Enums.AuditAction.Create,
            EntityName = "AppUser",
            EntityId = adminId.ToString(),
            IpAddress = "127.0.0.1",
            Timestamp = DateTime.UtcNow
        };
        await AddEntityAsync(auditLog);

        // 2. Unauthenticated
        var unauthResponse = await Client.GetAsync("/api/audit-logs");
        unauthResponse.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);

        // 3. Customer (Forbidden)
        AuthenticateCustomer();
        var customerResponse = await Client.GetAsync("/api/audit-logs");
        customerResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 4. Admin (Success)
        AuthenticateAdmin();
        var adminResponse = await Client.GetAsync("/api/audit-logs");
        adminResponse.EnsureSuccessStatusCode();

        var logs = await adminResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        logs.GetArrayLength().Should().BeGreaterThan(0);
    }
}
