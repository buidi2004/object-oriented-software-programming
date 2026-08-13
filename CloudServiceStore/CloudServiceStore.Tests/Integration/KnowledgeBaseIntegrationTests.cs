using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class KnowledgeBaseIntegrationTests : BaseIntegrationTest
{
    public KnowledgeBaseIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Create_And_GetKbArticle_ShouldSucceed()
    {
        AuthenticateAdmin();
        var authorId = Guid.NewGuid();
        await SeedUserAsync(authorId);

        var createCommand = new CreateKbArticleCommand("How to setup", "how-to-setup", "This is the content for the knowledge base article which is exactly more than 50 characters long.", "VPS", authorId, true);
        var createResponse = await Client.PostAsJsonAsync("/api/knowledgebase", createCommand);
        createResponse.EnsureSuccessStatusCode();

        var createContent = await createResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var id = createContent.GetProperty("id").GetGuid();

        var getResponse = await Client.GetAsync($"/api/knowledgebase/{id}");
        getResponse.EnsureSuccessStatusCode();

        var getContent = await getResponse.Content.ReadAsStringAsync();
        getContent.Should().Contain("How to setup");
        getContent.Should().Contain("how-to-setup");
    }
}
