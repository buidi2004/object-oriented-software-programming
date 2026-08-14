using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;
using CloudServiceStore.Application.Features.Banners.Commands.UpdateBanner;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class BannersIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public BannersIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateBanner_ShouldSucceed()
    {
        AuthenticateAdmin();
        var command = new CreateBannerCommand { ImageUrl = "https://example.com/banner.png", LinkUrl = "https://example.com/link" };
        var response = await Client.PostAsJsonAsync("/api/banners", command);
        response.EnsureSuccessStatusCode();


    }

    [Fact]
    public async Task CreateBanner_AsCustomer_ShouldFail()
    {
        AuthenticateCustomer();
        var command = new CreateBannerCommand { ImageUrl = "url", LinkUrl = "link" };
        var response = await Client.PostAsJsonAsync("/api/banners", command);
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetBanners_ShouldReturnActiveBanners()
    {
        var banner1 = new Banner { Id = Guid.NewGuid(), ImageUrl = "url1", LinkUrl = "link1", IsActive = true, DisplayOrder = 1 };
        var banner2 = new Banner { Id = Guid.NewGuid(), ImageUrl = "url2", LinkUrl = "link2", IsActive = false, DisplayOrder = 2 };
        
        await AddEntityAsync(banner1);
        await AddEntityAsync(banner2);

        var response = await Client.GetAsync("/api/banners");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<List<Banner>>();
        result.Should().NotBeNull();
        result.Should().Contain(b => b.ImageUrl == "url1");
    }

    [Fact]
    public async Task UpdateBanner_ShouldSucceed()
    {
        AuthenticateAdmin();
        var bannerId = Guid.NewGuid();
        var banner = new Banner { Id = bannerId, ImageUrl = "oldUrl", LinkUrl = "oldLink", IsActive = true, DisplayOrder = 1 };
        await AddEntityAsync(banner);

        var command = new UpdateBannerCommand { Id = bannerId, ImageUrl = "newUrl", LinkUrl = "newLink", IsActive = false, DisplayOrder = 2 };
        var response = await Client.PutAsJsonAsync($"/api/banners/{bannerId}", command);
        response.EnsureSuccessStatusCode();
    }
}
