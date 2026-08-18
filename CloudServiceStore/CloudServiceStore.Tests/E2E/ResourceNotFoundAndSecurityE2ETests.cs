using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.Roles.Commands.CreateRole;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ResourceNotFoundAndSecurityE2ETests : BaseE2ETest
{
    public ResourceNotFoundAndSecurityE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Theory]
    [InlineData("/api/orders", "GET")]
    [InlineData("/api/refund-requests", "GET")]
    [InlineData("/api/users", "GET")]
    [InlineData("/api/security/sessions", "GET")]
    [InlineData("/api/support-tickets/me", "GET")]
    public async Task ProtectedEndpoints_WithoutAuthToken_MustReturn401Unauthorized(string url, string method)
    {
        // Ensure no Authorization header is present
        Client.DefaultRequestHeaders.Authorization = null;

        var request = new HttpRequestMessage(new HttpMethod(method), url);
        var response = await Client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("/api/refund-requests")]
    [InlineData("/api/users")]
    [InlineData("/api/roles")]
    [InlineData("/api/dashboard/order-trend")]
    public async Task AdminEndpoints_WhenAccessedByCustomerRole_MustReturn403Forbidden(string url)
    {
        // Login as standard customer
        var custToken = await RegisterAndLoginCustomerAsync($"cust_sec_{Guid.NewGuid():N}@test.com", "Password123!");
        SetAuthToken(custToken);

        var response = await Client.GetAsync(url);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AdminMutations_WhenAccessedByCustomerRole_MustReturn403Forbidden()
    {
        var custToken = await RegisterAndLoginCustomerAsync($"cust_sec_{Guid.NewGuid():N}@test.com", "Password123!");
        SetAuthToken(custToken);

        var categoryCmd = new CreateCategoryCommand("Blocked Category", "blocked-cat");
        var resCat = await Client.PostAsJsonAsync("/api/categories", categoryCmd);
        resCat.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var roleCmd = new CreateRoleCommand("Blocked Role");
        var resRole = await Client.PostAsJsonAsync("/api/roles", roleCmd);
        resRole.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("/api/orders/")]
    [InlineData("/api/support-tickets/")]
    [InlineData("/api/refund-requests/")]
    [InlineData("/api/vpsinstances/")]
    public async Task NonExistentEntities_WhenQueriedById_MustReturn404NotFound(string urlPrefix)
    {
        var adminToken = await RegisterAndLoginAdminAsync($"admin_404_{Guid.NewGuid():N}@test.com", "Password123!");
        SetAuthToken(adminToken);

        var nonExistentId = Guid.NewGuid();
        var response = await Client.GetAsync($"{urlPrefix}{nonExistentId}");

        response.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
    }
}
