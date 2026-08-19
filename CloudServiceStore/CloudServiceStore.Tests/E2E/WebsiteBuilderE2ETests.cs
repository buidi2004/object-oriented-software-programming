using System.Net;
using System.Net.Http.Json;
using CloudServiceStore.Application.Features.WebsiteBuilder.Commands.CreateProject;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class WebsiteBuilderE2ETests : BaseE2ETest
{
    public WebsiteBuilderE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateProject_WithMissingFields_Returns400()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("customer_wb@test.com", "Password123!");
        var client = Client;
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var command = new CreateProjectCommand("", "", ""); // Missing all fields

        // Act
        var response = await client.PostAsJsonAsync("/api/website-builder/projects", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Tên dự án không được để trống");
        content.Should().Contain("IdempotencyKey là bắt buộc");
    }

    [Fact]
    public async Task CreateProject_WithDuplicateIdempotencyKey_ReturnsSameIdOr200()
    {
        // Arrange
        var token2 = await RegisterAndLoginCustomerAsync("customer_wb2@test.com", "Password123!");
        var client = Client;
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token2);
        var idempotencyKey = Guid.NewGuid().ToString();
        var command = new CreateProjectCommand("My Project 1", "template-1", idempotencyKey);

        // Act 1: First request
        var response1 = await client.PostAsJsonAsync("/api/website-builder/projects", command);
        response1.EnsureSuccessStatusCode();
        var result1 = await response1.Content.ReadFromJsonAsync<dynamic>();
        string id1 = result1?.id?.ToString() ?? "";

        // Act 2: Second request with same idempotency key but DIFFERENT name
        var command2 = new CreateProjectCommand("My Project 2", "template-1", idempotencyKey);
        var response2 = await client.PostAsJsonAsync("/api/website-builder/projects", command2);

        // Assert 2: Should return 200 OK with the SAME ID (idempotency behavior)
        response2.EnsureSuccessStatusCode();
        var result2 = await response2.Content.ReadFromJsonAsync<dynamic>();
        string id2 = result2?.id?.ToString() ?? "";

        id2.Should().Be(id1); // Returns existing resource ID
    }
}
