using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ManagedDatabases.Commands.CreateDatabase;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ManagedDatabaseE2ETests : BaseE2ETest
{
    public ManagedDatabaseE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateDatabase_MissingFields_Returns400()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("manageddb_test1@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var command = new CreateDatabaseCommand("", ManagedDatabaseEngine.MySQL, "", "", "", "");

        // Act
        var response = await Client.PostAsJsonAsync("/api/managed-databases", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Name");
        content.Should().Contain("Version");
        content.Should().Contain("AdminUser");
        content.Should().Contain("IdempotencyKey");
    }

    [Fact]
    public async Task CreateDatabase_Idempotency_ReturnsSameIdOr200()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("manageddb_test2@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var idempotencyKey = Guid.NewGuid().ToString();
        var command1 = new CreateDatabaseCommand(
            "mydb-1", 
            ManagedDatabaseEngine.PostgreSQL, 
            "14", 
            "postgres", 
            "SecurePass123", 
            idempotencyKey);

        // Act 1: Call 1st time
        var response1 = await Client.PostAsJsonAsync("/api/managed-databases", command1);
        response1.EnsureSuccessStatusCode();
        var result1 = await response1.Content.ReadFromJsonAsync<dynamic>();
        string dbId1 = result1?.GetProperty("databaseId").GetString() ?? "";

        // Act 2: Call 2nd time with SAME IdempotencyKey but different Name
        var command2 = new CreateDatabaseCommand(
            "mydb-2", 
            ManagedDatabaseEngine.PostgreSQL, 
            "14", 
            "postgres", 
            "SecurePass123", 
            idempotencyKey);
        var response2 = await Client.PostAsJsonAsync("/api/managed-databases", command2);

        // Assert
        response2.EnsureSuccessStatusCode();
        var result2 = await response2.Content.ReadFromJsonAsync<dynamic>();
        string dbId2 = result2?.GetProperty("databaseId").GetString() ?? "";

        // Should return the exact same ID, not creating a new one
        dbId2.Should().Be(dbId1);
    }
}
