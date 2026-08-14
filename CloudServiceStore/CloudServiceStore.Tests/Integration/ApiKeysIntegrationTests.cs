using System;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ApiKeys.Commands.GenerateApiKey;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class ApiKeysIntegrationTests : BaseIntegrationTest
{
    public ApiKeysIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Generate_And_ManageApiKeys_ShouldSucceed()
    {
        // 1. Arrange Customer
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        AuthenticateCustomer();

        // 2. Generate API Key
        var generateCommand = new GenerateApiKeyCommand("READ,WRITE");
        var generateResponse = await Client.PostAsJsonAsync("/api/api-keys", generateCommand);
        generateResponse.EnsureSuccessStatusCode();
        var generateContent = await generateResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var plainTextKey = generateContent.GetProperty("key").GetString();
        plainTextKey.Should().NotBeNullOrWhiteSpace();

        // 3. Get My API Keys
        var getResponse = await Client.GetAsync("/api/api-keys/me");
        getResponse.EnsureSuccessStatusCode();
        var getContent = await getResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        
        var keysArray = getContent.EnumerateArray();
        keysArray.Should().ContainSingle();
        var keyId = keysArray.First().GetProperty("id").GetGuid();

        // 4. Revoke API Key
        var revokeResponse = await Client.DeleteAsync($"/api/api-keys/{keyId}");
        revokeResponse.EnsureSuccessStatusCode();
    }
}
