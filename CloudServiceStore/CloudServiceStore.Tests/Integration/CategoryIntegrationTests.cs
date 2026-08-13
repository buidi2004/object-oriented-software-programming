using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.Categories.Queries.GetCategories;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class CategoryIntegrationTests : BaseIntegrationTest
{
    public CategoryIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateCategory_Then_GetCategories_ShouldReturnCategory()
    {
        // 1. Arrange
        AuthenticateAdmin(); // Optional, but usually needed for Admin endpoints
        var createCommand = new CreateCategoryCommand("Hosting Linux", "hosting-linux");

        // 2. Act (POST)
        var postResponse = await Client.PostAsJsonAsync("/api/categories", createCommand);
        postResponse.EnsureSuccessStatusCode();

        // 3. Act (GET)
        var getResponse = await Client.GetAsync("/api/categories");
        if (!getResponse.IsSuccessStatusCode)
        {
            var error = await getResponse.Content.ReadAsStringAsync();
            throw new System.Exception($"GET /api/categories failed with {getResponse.StatusCode}: {error}");
        }
        var categories = await getResponse.Content.ReadFromJsonAsync<List<CategoryDto>>();

        // 4. Assert
        categories.Should().NotBeNull();
        categories.Should().ContainSingle();
        categories![0].Name.Should().Be("Hosting Linux");
        categories[0].Slug.Should().Be("hosting-linux");
    }
}
