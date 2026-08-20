using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class StaticSiteE2ETests : BaseE2ETest
{
    public StaticSiteE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateStaticSite_MissingName_Returns400()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("staticsite_test1@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var command = new CreateStaticSiteCommand("", Guid.NewGuid().ToString());

        // Act
        var response = await Client.PostAsJsonAsync("/api/static-sites", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Name");
    }

    [Fact]
    public async Task CreateStaticSite_Idempotency_Works()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("staticsite_test2@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        
        var idempotencyKey = Guid.NewGuid().ToString();
        var command = new CreateStaticSiteCommand("My Awesome Site", idempotencyKey);

        // Act
        var response1 = await Client.PostAsJsonAsync("/api/static-sites", command);
        var response2 = await Client.PostAsJsonAsync("/api/static-sites", command);

        // Assert
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);

        var content1 = await response1.Content.ReadAsStringAsync();
        var content2 = await response2.Content.ReadAsStringAsync();

        content1.Should().Be(content2);
    }
}
