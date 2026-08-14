using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class FaqsIntegrationTests : BaseIntegrationTest
{
    public FaqsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Create_And_GetAllFaqs_ShouldSucceed()
    {
        AuthenticateAdmin();
        var createCommand = new CreateFaqItemCommand("This is a question Q1?", "This is an answer A1 which is at least 10 chars", "General", 1);
        var createResponse = await Client.PostAsJsonAsync("/api/faqs", createCommand);
        createResponse.EnsureSuccessStatusCode();

        var getResponse = await Client.GetAsync("/api/faqs");
        getResponse.EnsureSuccessStatusCode();
        var getContent = await getResponse.Content.ReadAsStringAsync();
        getContent.Should().Contain("Q1?");
        getContent.Should().Contain("A1");
    }
}
