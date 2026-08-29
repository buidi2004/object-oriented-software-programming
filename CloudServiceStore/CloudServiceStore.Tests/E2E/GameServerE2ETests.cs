using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class GameServerE2ETests : BaseE2ETest
{
    public GameServerE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateGameServer_MissingFields_Returns400()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("game_test1@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var command = new CreateGameServerCommand("", GameType.Minecraft, Guid.NewGuid(), "");

        // Act
        var response = await Client.PostAsJsonAsync("/api/game-servers", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("ServerName");
        content.Should().Contain("IdempotencyKey");
    }

    [Fact]
    public async Task CreateGameServer_Idempotency_ReturnsSameIdOr200()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("game_test2@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var idempotencyKey = Guid.NewGuid().ToString();
        var command1 = new CreateGameServerCommand("My Rust Server", GameType.Rust, Guid.NewGuid(), idempotencyKey);

        // Act 1
        var response1 = await Client.PostAsJsonAsync("/api/game-servers", command1);
        response1.EnsureSuccessStatusCode();
        var result1 = await response1.Content.ReadFromJsonAsync<dynamic>();
        string id1 = result1?.GetProperty("serverId").GetString() ?? "";

        // Act 2 (Duplicate)
        var command2 = new CreateGameServerCommand("Another Server", GameType.CS2, Guid.NewGuid(), idempotencyKey);
        var response2 = await Client.PostAsJsonAsync("/api/game-servers", command2);

        // Assert
        response2.EnsureSuccessStatusCode();
        var result2 = await response2.Content.ReadFromJsonAsync<dynamic>();
        string id2 = result2?.GetProperty("serverId").GetString() ?? "";

        id2.Should().Be(id1);
    }
}
