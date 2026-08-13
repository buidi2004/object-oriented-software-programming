using System;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class SeoIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public SeoIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }
    [Fact]
    public async Task GetSitemap_ShouldSucceed_AndReturnXml()
    {
        // 1. Seed Categories & ServicePlans & NewsArticles
        var categoryId = Guid.NewGuid();
        var category = new ServiceCategory { Id = categoryId, Name = "Hosting", Slug = "hosting" };
        await AddEntityAsync(category);

        var servicePlan = new ServicePlan(categoryId, "Plan 1", "1 Core", "1GB", "10GB", "1TB", null);
        await AddEntityAsync(servicePlan);

        var authorId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(authorId);

        var kbId = Guid.NewGuid();
        var kb = new KnowledgeBaseArticle("KB 1", "kb-1", "Test", "Hosting", authorId, true) { Id = kbId };
        await AddEntityAsync(kb);

        // 2. Request Sitemap
        var response = await Client.GetAsync("/sitemap.xml");
        response.EnsureSuccessStatusCode();

        var xml = await response.Content.ReadAsStringAsync();
        xml.Should().Contain("<?xml");
        xml.Should().Contain("<urlset");
        xml.Should().Contain($"<loc>http://localhost/services/{servicePlan.Id}</loc>");
        xml.Should().Contain($"<loc>http://localhost/kb/kb-1</loc>");
    }
}
