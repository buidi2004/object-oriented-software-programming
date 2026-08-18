using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class GeneratedMissingEndpointsE2ETests : BaseE2ETest
{
    public GeneratedMissingEndpointsE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Theory]
    [InlineData("/api/refund-requests")]
    [InlineData("/api/settings")]
    [InlineData("/api/promotions")]
    [InlineData("/api/vpsinstances")]
    [InlineData("/api/service-plans")]
    [InlineData("/api/dashboard/order-trend")]
    [InlineData("/api/migration-requests")]
    [InlineData("/api/categories")]
    public async Task AdminGetEndpoints_ShouldReturnSuccessStatusCode(string url)
    {
        var adminToken = await RegisterAndLoginAdminAsync($"admin_{Guid.NewGuid():N}@example.com", "Password123!");
        SetAuthToken(adminToken);

        var response = await Client.GetAsync(url);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Theory]
    [InlineData("/api/refund-requests/me")]
    [InlineData("/api/dashboard/me")]
    [InlineData("/api/migration-requests/me")]
    public async Task CustomerGetEndpoints_ShouldReturnSuccessStatusCode(string url)
    {
        var token = await RegisterAndLoginCustomerAsync($"cust_{Guid.NewGuid():N}@example.com", "Password123!");
        SetAuthToken(token);

        var response = await Client.GetAsync(url);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task NonExistentEntities_ShouldReturnNotFoundOrBadRequest_WithProblemDetails()
    {
        var adminToken = await RegisterAndLoginAdminAsync($"admin_strict_{Guid.NewGuid():N}@example.com", "Password123!");
        SetAuthToken(adminToken);

        var randomId = Guid.NewGuid();

        // 1. Reject non-existent refund request
        var rejectRefundRes = await Client.PatchAsync($"/api/refund-requests/{randomId}/reject", null);
        rejectRefundRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
        await rejectRefundRes.ShouldBeProblemDetailsAsync(rejectRefundRes.StatusCode);

        // 2. Get non-existent VPS instance
        var vpsRes = await Client.GetAsync($"/api/vpsinstances/{randomId}");
        vpsRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
        await vpsRes.ShouldBeProblemDetailsAsync(vpsRes.StatusCode);

        // 3. Delete non-existent promotion
        var delPromoRes = await Client.DeleteAsync($"/api/promotions/{randomId}");
        delPromoRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
        await delPromoRes.ShouldBeProblemDetailsAsync(delPromoRes.StatusCode);

        // 4. Update status on non-existent migration request
        var patchMigrationRes = await Client.PatchAsync($"/api/migration-requests/{randomId}/status", JsonContent.Create(new { status = 1 }));
        patchMigrationRes.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
        await patchMigrationRes.ShouldBeProblemDetailsAsync(patchMigrationRes.StatusCode);
    }
}
