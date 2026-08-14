using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;
using CloudServiceStore.Application.Features.Newsletters.Commands.SubscribeNewsletter;
using CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class MarketingE2ETests : BaseE2ETest
{
    public MarketingE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Marketing_And_Testimonials_Workflow_ShouldWorkCorrectly()
    {
        // 1. Subscribe to Newsletter
        var subscribeCmd = new SubscribeNewsletterCommand { Email = "subscriber@test.com" };
        var subRes = await Client.PostAsJsonAsync("/api/newsletter/subscribe", subscribeCmd);
        subRes.EnsureSuccessStatusCode();

        // 2. Admin Login
        var adminToken = await RegisterAndLoginAdminAsync("admin_mkt@test.com", "Admin@123");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 3. Admin Creates Banner
        var createBannerCmd = new CreateBannerCommand { ImageUrl = "https://img.url", LinkUrl = "https://link.url", DisplayOrder = 1, IsActive = true };
        var bannerRes = await Client.PostAsJsonAsync("/api/banners", createBannerCmd);
        bannerRes.EnsureSuccessStatusCode();
        
        // 4. Verify Banners listed
        Client.DefaultRequestHeaders.Authorization = null; // Public API
        var getBannersRes = await Client.GetAsync("/api/banners");
        getBannersRes.EnsureSuccessStatusCode();
        var bannersStr = await getBannersRes.Content.ReadAsStringAsync();
        bannersStr.Should().Contain("img.url");

        // 5. Setup Customer & Order for Review
        var customerToken = await RegisterAndLoginCustomerAsync("cust_mkt@test.com", "Cust@123");
        
        Guid customerId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            customerId = (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == "cust_mkt@test.com")).Id;
        }

        var categoryId = Guid.NewGuid();
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Hosting", Slug = "hosting" });

        var planId = Guid.NewGuid();
        await AddEntityAsync(new ServicePlan { Id = planId, Name = "Basic Plan", CategoryId = categoryId, IsActive = true });
        
        // 6. Seed Review in Database (Since SubmitReview API does not exist yet)
        var reviewId = Guid.NewGuid();
        await AddEntityAsync(new Review
        {
            Id = reviewId,
            UserId = customerId,
            ServicePlanId = planId,
            Rating = 5,
            Comment = "The service is absolutely wonderful!",
            IsApproved = true,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow
        });

        // 7. Admin Features the Review as Testimonial
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var featureCmd = new FeatureTestimonialCommand { ReviewId = reviewId, IsFeatured = true };
        var featureRes = await Client.PatchAsJsonAsync($"/api/reviews/{reviewId}/feature", featureCmd);
        featureRes.EnsureSuccessStatusCode();

        // 8. Public API lists Testimonial
        Client.DefaultRequestHeaders.Authorization = null;
        var getTestimonialsRes = await Client.GetAsync("/api/testimonials");
        getTestimonialsRes.EnsureSuccessStatusCode();
        var testimonialsStr = await getTestimonialsRes.Content.ReadAsStringAsync();
        testimonialsStr.Should().Contain("The service is absolutely wonderful!");
    }
}
