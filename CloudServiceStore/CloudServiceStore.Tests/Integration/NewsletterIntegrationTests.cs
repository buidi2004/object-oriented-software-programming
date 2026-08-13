using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Newsletters.Commands.SubscribeNewsletter;
using CloudServiceStore.Application.Features.Newsletters.Commands.UnsubscribeNewsletter;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class NewsletterIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public NewsletterIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Subscribe_ShouldSucceed()
    {
        var command = new SubscribeNewsletterCommand { Email = "test-subscriber@example.com" };
        var response = await Client.PostAsJsonAsync("/api/newsletter/subscribe", command);
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Unsubscribe_ShouldSucceed()
    {
        var subscriber = new CloudServiceStore.Domain.Entities.NewsletterSubscriber { Id = Guid.NewGuid(), Email = "test-subscriber@example.com", IsActive = true, SubscribedAt = DateTime.UtcNow };
        await AddEntityAsync(subscriber);

        var command = new UnsubscribeNewsletterCommand { Email = "test-subscriber@example.com" };
        var request = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Delete, "/api/newsletter/unsubscribe")
        {
            Content = System.Net.Http.Json.JsonContent.Create(command)
        };
        var response = await Client.SendAsync(request);
        response.EnsureSuccessStatusCode();
    }

    private record NewsletterResponse(bool Success);
}
