using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.News.Commands.CreateArticle;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class NewsIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public NewsIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateArticle_ShouldSucceed()
    {
        AuthenticateAdmin();
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(adminId);
        var command = new CreateNewsArticleCommand("My News Title", "my-news-title", "Hello world this is news");
        var response = await Client.PostAsJsonAsync("/api/news", command);
        response.EnsureSuccessStatusCode();


    }

    [Fact]
    public async Task CreateArticle_AsCustomer_ShouldFail()
    {
        AuthenticateCustomer();
        var command = new CreateNewsArticleCommand("Customer Title", "customer-title", "Content");
        var response = await Client.PostAsJsonAsync("/api/news", command);
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task PublishArticle_ShouldSucceed()
    {
        AuthenticateAdmin();
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(adminId);
        
        var article = new NewsArticle("Old Title", "old-title", "Content", adminId);
        await AddEntityAsync(article);

        var response = await Client.PatchAsync($"/api/news/{article.Id}/publish", null);
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetArticles_ShouldReturnList()
    {
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(adminId);
        
        var article1 = new NewsArticle("Published News 1", "pub-news-1", "Test", adminId, status: CloudServiceStore.Domain.Enums.ArticleStatus.Published);
        var article2 = new NewsArticle("Draft News", "draft-news", "Draft", adminId, status: CloudServiceStore.Domain.Enums.ArticleStatus.Draft);
        
        await AddEntityAsync(article1);
        await AddEntityAsync(article2);

        var response = await Client.GetAsync("/api/news?onlyPublished=true");
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Published News 1");
        content.Should().NotContain("Draft News");
    }

    [Fact]
    public async Task GetArticleBySlug_ShouldSucceed()
    {
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(adminId);
        var article = new NewsArticle("Unique Slug", "unique-slug-article", "Content here", adminId, status: CloudServiceStore.Domain.Enums.ArticleStatus.Published);
        await AddEntityAsync(article);

        var response = await Client.GetAsync($"/api/news/{article.Slug}");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadAsStringAsync();
        result.Should().Contain(article.Slug);
    }
}
