using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.BlogComments.Commands.AddComment;
using CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;
using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;
using CloudServiceStore.Application.Features.News.Commands.CreateArticle;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ContentCommunityE2ETests : BaseE2ETest
{
    public ContentCommunityE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Content_And_Community_Workflow_ShouldWorkCorrectly()
    {
        // 1. Admin Login
        var adminToken = await RegisterAndLoginAdminAsync("admin_content@test.com", "Admin@123");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 2. Admin creates FAQ
        var createFaqCmd = new CreateFaqItemCommand("How to reset password?", "Click on forgot password.", "Account", 1);
        var faqRes = await Client.PostAsJsonAsync("/api/faqs", createFaqCmd);
        faqRes.EnsureSuccessStatusCode();

        // 3. Admin creates KnowledgeBase Article
        Guid adminId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            adminId = (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == "admin_content@test.com")).Id;
        }

        var createKbCmd = new CreateKbArticleCommand("Setting up VPS", "setup-vps", "Step 1: First you need to log in to the control panel and click on the provision button to start your new VPS server.", "VPS", adminId, true);
        var kbRes = await Client.PostAsJsonAsync("/api/knowledgebase", createKbCmd);
        kbRes.EnsureSuccessStatusCode();
        var kbJson = await kbRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var kbId = kbJson.GetProperty("id").GetGuid();

        // 4. Admin creates News Article
        var createNewsCmd = new CreateNewsArticleCommand("System Update", "system-update", "We have updated the system to the latest version. Please enjoy the new features we have prepared for you today.");
        var newsRes = await Client.PostAsJsonAsync("/api/news", createNewsCmd);
        newsRes.EnsureSuccessStatusCode();
        
        var newsJson = await newsRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var articleId = newsJson.GetProperty("id").GetGuid();

        // 5. Admin publishes News Article
        var publishRes = await Client.PatchAsync($"/api/news/{articleId}/publish", null);
        publishRes.EnsureSuccessStatusCode();

        // 6. Public fetches News, FAQ, KB
        Client.DefaultRequestHeaders.Authorization = null;
        var publicNewsRes = await Client.GetAsync("/api/news/system-update");
        publicNewsRes.EnsureSuccessStatusCode();

        var publicFaqRes = await Client.GetAsync("/api/faqs");
        publicFaqRes.EnsureSuccessStatusCode();
        var faqStr = await publicFaqRes.Content.ReadAsStringAsync();
        faqStr.Should().Contain("How to reset password?");

        var publicKbRes = await Client.GetAsync($"/api/knowledgebase/{kbId}");
        publicKbRes.EnsureSuccessStatusCode();
        var kbStr = await publicKbRes.Content.ReadAsStringAsync();
        kbStr.Should().Contain("Setting up VPS");

        // 7. Customer submits Blog Comment
        var customerToken = await RegisterAndLoginCustomerAsync("cust_content@test.com", "Cust@123");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
        
        var addCommentCmd = new AddCommentCommand(articleId, "Great update, thanks!");
        var commentRes = await Client.PostAsJsonAsync("/api/comments", addCommentCmd);
        commentRes.EnsureSuccessStatusCode();

        // 8. Public fetches comments
        Client.DefaultRequestHeaders.Authorization = null;
        var getCommentsRes = await Client.GetAsync($"/api/articles/{articleId}/comments");
        getCommentsRes.EnsureSuccessStatusCode();
        var commentsStr = await getCommentsRes.Content.ReadAsStringAsync();
        commentsStr.Should().Contain("Great update, thanks!");

        // 9. Admin Updates News Article
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var updateNewsCmd = new CloudServiceStore.Application.Features.News.Commands.UpdateArticle.UpdateNewsArticleCommand(articleId, "Updated Title", "updated-title", "Updated content");
        var updateNewsRes = await Client.PutAsJsonAsync($"/api/news/{articleId}", updateNewsCmd);
        updateNewsRes.EnsureSuccessStatusCode();

        // 10. Admin gets all News Articles
        var getAllNewsRes = await Client.GetAsync("/api/news");
        getAllNewsRes.EnsureSuccessStatusCode();
        var allNewsJson = await getAllNewsRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        GetItemsCount(allNewsJson).Should().BeGreaterThan(0);

        // 11. Admin Deletes News Article
        var deleteNewsRes = await Client.DeleteAsync($"/api/news/{articleId}");
        deleteNewsRes.EnsureSuccessStatusCode();
    }
}
