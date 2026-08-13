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
        
        var article = new NewsArticle { Id = Guid.NewGuid(), Title = "Old Title", Slug = "old-title", Content = "Content", AuthorId = adminId };
        await AddEntityAsync(article);

        var response = await Client.PatchAsync($"/api/news/{article.Id}/publish", null);
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task GetArticles_ShouldReturnList()
    {
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(adminId);
        
        var article1 = new NewsArticle { Id = Guid.NewGuid(), Title = "Published News 1", Slug = "pub-news-1", Content = "Test", Status = CloudServiceStore.Domain.Enums.ArticleStatus.Published, AuthorId = adminId };
        var article2 = new NewsArticle { Id = Guid.NewGuid(), Title = "Draft News", Slug = "draft-news", Content = "Draft", Status = CloudServiceStore.Domain.Enums.ArticleStatus.Draft, AuthorId = adminId };
        
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
        var article = new NewsArticle { Id = Guid.NewGuid(), Title = "Unique Slug", Slug = "unique-slug-article", Content = "Content here", Status = CloudServiceStore.Domain.Enums.ArticleStatus.Published, AuthorId = adminId };
        await AddEntityAsync(article);

        var response = await Client.GetAsync($"/api/news/{article.Slug}");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadAsStringAsync();
        result.Should().Contain(article.Slug);
    }
}
