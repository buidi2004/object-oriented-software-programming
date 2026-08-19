using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class GeneralModulesExceptionMappingTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public GeneralModulesExceptionMappingTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetVpsInstance_NonExistent_Returns404NotFound()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/vpsinstances/{Guid.NewGuid()}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetHosting_NonExistent_Returns404NotFound()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/hosting/{Guid.NewGuid()}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetManagedDatabase_NonExistent_Returns404NotFound()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/managed-databases/{Guid.NewGuid()}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "customer");

        var response = await _client.SendAsync(request);
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NotFound, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetNewsBySlug_NonExistent_Returns404NotFound()
    {
        var response = await _client.GetAsync($"/api/news/non-existent-slug-{Guid.NewGuid():N}");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetServicePlanById_NonExistent_Returns404NotFound()
    {
        var response = await _client.GetAsync($"/api/service-plans/{Guid.NewGuid()}");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCategoryPlansBySlug_NonExistent_Returns404NotFound()
    {
        var response = await _client.GetAsync($"/api/categories/non-existent-category-{Guid.NewGuid():N}/plans");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
