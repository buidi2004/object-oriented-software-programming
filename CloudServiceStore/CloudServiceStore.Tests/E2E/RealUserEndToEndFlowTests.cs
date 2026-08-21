using System;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;
using CloudServiceStore.Application.Features.ManagedDatabases.Commands.CreateDatabase;
using CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;
using CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;
using CloudServiceStore.Application.Features.StaticSites.Commands.DeployStaticSite;
using CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class RealUserEndToEndFlowTests : BaseE2ETest
{
    public RealUserEndToEndFlowTests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task RealUser_ManagedDatabase_FullLifecycle_ShouldSucceed()
    {
        // 1. User Register & Login
        var userEmail = $"user_db_{Guid.NewGuid():N}@cloudhost.vn";
        var token = await RegisterAndLoginCustomerAsync(userEmail, "SecureP@ssword123!");
        token.Should().NotBeNullOrEmpty();
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. User Creates a Managed PostgreSQL Database
        var idempotencyKey = $"db-idem-{Guid.NewGuid()}";
        var createDbCmd = new CreateDatabaseCommand(
            "production-pg-db",
            ManagedDatabaseEngine.PostgreSQL,
            "16",
            "postgres",
            "StrongAdminPass123!",
            idempotencyKey);

        var createRes = await Client.PostAsJsonAsync("/api/managed-databases", createDbCmd);
        createRes.EnsureSuccessStatusCode();

        var createJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var dbId = createJson.GetProperty("databaseId").GetString();
        dbId.Should().NotBeNullOrEmpty();

        // 3. User Views Databases List (/api/databases and /api/managed-databases/me)
        var listRes = await Client.GetAsync("/api/databases");
        listRes.EnsureSuccessStatusCode();

        var listJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();
        listJson.ValueKind.Should().Be(JsonValueKind.Array);
        listJson.GetArrayLength().Should().BeGreaterThan(0);

        var firstDb = listJson.EnumerateArray().First();
        firstDb.GetProperty("name").GetString().Should().Be("production-pg-db");
        firstDb.GetProperty("engine").GetString().Should().Be("PostgreSQL");
    }

    [Fact]
    public async Task RealUser_GameServer_FullLifecycle_ShouldSucceed()
    {
        // 1. User Register & Login
        var userEmail = $"user_game_{Guid.NewGuid():N}@cloudhost.vn";
        var token = await RegisterAndLoginCustomerAsync(userEmail, "SecureP@ssword123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. User Creates a Minecraft Game Server
        var idempotencyKey = $"game-idem-{Guid.NewGuid()}";
        var createGameCmd = new CreateGameServerCommand(
            "Survival-World-Minecraft",
            GameType.Minecraft,
            idempotencyKey);

        var createRes = await Client.PostAsJsonAsync("/api/game-servers", createGameCmd);
        createRes.EnsureSuccessStatusCode();

        var createJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var serverId = createJson.GetProperty("serverId").GetString();
        serverId.Should().NotBeNullOrEmpty();

        // 3. User Retrieves Game Servers List
        var listRes = await Client.GetAsync("/api/game-servers");
        listRes.EnsureSuccessStatusCode();

        var listJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();
        listJson.GetArrayLength().Should().BeGreaterThan(0);

        var firstServer = listJson.EnumerateArray().First();
        firstServer.GetProperty("serverName").GetString().Should().Be("Survival-World-Minecraft");
        firstServer.GetProperty("gameTypeName").GetString().Should().Be("Minecraft");
    }

    [Fact]
    public async Task RealUser_ObjectStorage_FullLifecycle_ShouldSucceed()
    {
        // 1. User Register & Login
        var userEmail = $"user_storage_{Guid.NewGuid():N}@cloudhost.vn";
        var token = await RegisterAndLoginCustomerAsync(userEmail, "SecureP@ssword123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. User Creates MinIO S3 Bucket
        var bucketName = $"user-media-bucket-{Guid.NewGuid():N}";
        var idempotencyKey = $"storage-idem-{Guid.NewGuid()}";
        var createBucketCmd = new CreateBucketCommand(bucketName, "ap-southeast-1", idempotencyKey);

        var createRes = await Client.PostAsJsonAsync("/api/object-storage/buckets", createBucketCmd);
        createRes.EnsureSuccessStatusCode();

        // 3. User Retrieves Buckets List via /api/storage/buckets
        var listRes = await Client.GetAsync("/api/storage/buckets");
        listRes.EnsureSuccessStatusCode();

        var listJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();
        listJson.GetArrayLength().Should().BeGreaterThan(0);

        var firstBucket = listJson.EnumerateArray().First();
        firstBucket.GetProperty("bucketName").GetString().Should().Be(bucketName);
        firstBucket.GetProperty("region").GetString().Should().Be("ap-southeast-1");
    }

    [Fact]
    public async Task RealUser_StaticSite_CreateAndDeploy_ShouldSucceed()
    {
        // 1. User Register & Login
        var userEmail = $"user_site_{Guid.NewGuid():N}@cloudhost.vn";
        var token = await RegisterAndLoginCustomerAsync(userEmail, "SecureP@ssword123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. User Creates a Static Site
        var idempotencyKey = $"site-idem-{Guid.NewGuid()}";
        var createSiteCmd = new CreateStaticSiteCommand(
            "my-landing-page",
            idempotencyKey);

        var createRes = await Client.PostAsJsonAsync("/api/static-sites", createSiteCmd);
        createRes.EnsureSuccessStatusCode();

        var createJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var siteId = createJson.GetProperty("id").GetGuid();
        siteId.Should().NotBeEmpty();

        // 3. User Deploys the Static Site
        var deployCmd = new DeployStaticSiteCommand(siteId, "git-commit-initial-hash");
        var deployRes = await Client.PostAsJsonAsync($"/api/static-sites/{siteId}/deploy", deployCmd);
        deployRes.EnsureSuccessStatusCode();

        // 4. User Lists Sites
        var listRes = await Client.GetAsync("/api/static-sites");
        listRes.EnsureSuccessStatusCode();

        var listJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();
        listJson.GetArrayLength().Should().BeGreaterThan(0);
        listJson.EnumerateArray().First().GetProperty("name").GetString().Should().Be("my-landing-page");
    }

    [Fact]
    public async Task RealUser_SupportTicket_CreateAndCommunicate_ShouldSucceed()
    {
        // 1. User Register & Login
        var userEmail = $"user_support_{Guid.NewGuid():N}@cloudhost.vn";
        var token = await RegisterAndLoginCustomerAsync(userEmail, "SecureP@ssword123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. User Creates a Technical Support Ticket
        var createTicketCmd = new CreateTicketCommand(
            "Cần hỗ trợ cấu hình SSL Custom Domain",
            TicketPriority.High);

        var createRes = await Client.PostAsJsonAsync("/api/tickets", createTicketCmd);
        createRes.EnsureSuccessStatusCode();

        var createJson = await createRes.Content.ReadFromJsonAsync<JsonElement>();
        var ticketId = createJson.GetProperty("id").GetGuid();
        ticketId.Should().NotBeEmpty();

        // 3. User Lists My Tickets via /api/tickets/me
        var listRes = await Client.GetAsync("/api/tickets/me");
        listRes.EnsureSuccessStatusCode();

        var listJson = await listRes.Content.ReadFromJsonAsync<JsonElement>();
        listJson.GetArrayLength().Should().BeGreaterThan(0);
        listJson.EnumerateArray().First().GetProperty("subject").GetString().Should().Contain("SSL Custom Domain");
    }
}
