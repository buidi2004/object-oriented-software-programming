using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class ImageUploadIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ImageUploadIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task UploadBannerImage_ValidImage_Returns200AndUpdatesUrl()
    {
        // 1. Arrange: Create a Banner in DB
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var banner = new Banner
        {
            Id = Guid.NewGuid(),
            ImageUrl = "http://old-url.com/old.jpg",
            LinkUrl = "https://promo.com",
            DisplayOrder = 1,
            IsActive = true
        };
        db.Banners.Add(banner);
        await db.SaveChangesAsync();

        // Prepare multipart form data with dummy image bytes
        using var content = new MultipartFormDataContent();
        var fakeImageBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46 }; // JPEG header
        var byteContent = new ByteArrayContent(fakeImageBytes);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(byteContent, "file", "test_banner.jpg");

        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/banners/{banner.Id}/image")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "admin");

        // 2. Act
        var response = await _client.SendAsync(request);

        // 3. Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var updated = await verifyDb.Banners.FindAsync(banner.Id);
        updated.Should().NotBeNull();
        updated!.ImageUrl.Should().StartWith("/images/banners/");
    }

    [Fact]
    public async Task UploadBannerImage_FileTooLarge_Returns400BadRequest()
    {
        // 1. Arrange
        var bannerId = Guid.NewGuid();
        using var content = new MultipartFormDataContent();
        var largeBytes = new byte[6 * 1024 * 1024]; // 6MB > 5MB limit
        var byteContent = new ByteArrayContent(largeBytes);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        content.Add(byteContent, "file", "huge.png");

        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/banners/{bannerId}/image")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "admin");

        // 2. Act
        var response = await _client.SendAsync(request);

        // 3. Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadBannerImage_NotAnImage_Returns400BadRequest()
    {
        // 1. Arrange
        var bannerId = Guid.NewGuid();
        using var content = new MultipartFormDataContent();
        var textBytes = System.Text.Encoding.UTF8.GetBytes("alert('malicious')");
        var byteContent = new ByteArrayContent(textBytes);
        byteContent.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        content.Add(byteContent, "file", "script.txt");

        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/banners/{bannerId}/image")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "admin");

        // 2. Act
        var response = await _client.SendAsync(request);

        // 3. Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
