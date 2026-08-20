using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class RbacIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public RbacIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData("/api/admin/databases")]
    [InlineData("/api/admin/marketplace")]
    [InlineData("/api/admin/security")]
    [InlineData("/api/audit-logs")]
    [InlineData("/api/settings")]
    [InlineData("/api/users")]
    [InlineData("/api/roles")]
    public async Task AdminRoutes_WithoutToken_MustReturn401Unauthorized(string route)
    {
        // Arrange: no authorization header
        var request = new HttpRequestMessage(HttpMethod.Get, route);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("/api/admin/databases")]
    [InlineData("/api/admin/marketplace")]
    [InlineData("/api/admin/security")]
    [InlineData("/api/audit-logs")]
    [InlineData("/api/settings")]
    [InlineData("/api/users")]
    [InlineData("/api/roles")]
    public async Task AdminRoutes_WithCustomerToken_MustReturn403Forbidden(string route)
    {
        // Arrange: with Customer role token
        var request = new HttpRequestMessage(HttpMethod.Get, route);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("/api/admin/databases")]
    [InlineData("/api/admin/marketplace")]
    [InlineData("/api/admin/security")]
    [InlineData("/api/audit-logs")]
    [InlineData("/api/settings")]
    [InlineData("/api/users")]
    [InlineData("/api/roles")]
    public async Task AdminRoutes_WithAdminToken_MustReturn200OK(string route)
    {
        // Arrange: with Admin role token
        var request = new HttpRequestMessage(HttpMethod.Get, route);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "admin");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
