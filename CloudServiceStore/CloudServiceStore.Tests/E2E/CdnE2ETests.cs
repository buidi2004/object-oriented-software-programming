using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Cdn.Commands.CreateCdn;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class CdnE2ETests : BaseE2ETest
{
    public CdnE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateCdn_InvalidUrl_Returns400()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("cdn_test1@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var command = new CreateCdnCommand("invalid-url", Guid.NewGuid().ToString());

        // Act
        var response = await Client.PostAsJsonAsync("/api/cdn", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("OriginUrl");
    }

    [Fact]
    public async Task CreateCdn_Idempotency_Works()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("cdn_test2@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        
        var idempotencyKey = Guid.NewGuid().ToString();
        var command = new CreateCdnCommand("https://myorigin.com", idempotencyKey);

        // Act
        var response1 = await Client.PostAsJsonAsync("/api/cdn", command);
        var response2 = await Client.PostAsJsonAsync("/api/cdn", command);

        // Assert
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);

        var content1 = await response1.Content.ReadAsStringAsync();
        var content2 = await response2.Content.ReadAsStringAsync();

        content1.Should().Be(content2); // Cùng trả về ID
    }
}
