using System;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Reviews.Commands.CreateReview;
using CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ReviewE2ETests : BaseE2ETest
{
    public ReviewE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Review_Workflow_ShouldWorkCorrectly()
    {
        // 1. Create a Service Plan as Admin
        var adminToken = await RegisterAndLoginAdminAsync("admin_review@test.com", "Admin@123");
        SetAuthToken(adminToken);

        var createCategoryCmd = new CreateCategoryCommand("Hosting", "hosting");
        var catRes = await Client.PostAsJsonAsync("/api/categories", createCategoryCmd);
        catRes.EnsureSuccessStatusCode();
        var catId = await catRes.Content.ReadFromJsonAsync<Guid>();

        var createPlanCmd = new CreateServicePlanCommand(
            catId,
            "Basic Hosting",
            "1 Core",
            "1GB",
            "10GB",
            "100GB",
            true
        );
        var planRes = await Client.PostAsJsonAsync("/api/service-plans", createPlanCmd);
        planRes.EnsureSuccessStatusCode();
        var planJson = await planRes.Content.ReadFromJsonAsync<JsonElement>();
        var planId = planJson.GetProperty("id").GetGuid();

        // 2. Customer writes a review
        var customerToken = await RegisterAndLoginCustomerAsync("cust_review@test.com", "Cust@123");
        SetAuthToken(customerToken);

        var createReviewCmd = new CreateReviewCommand(planId, 5, "Great service!");
        var reviewRes = await Client.PostAsJsonAsync("/api/reviews", createReviewCmd);
        reviewRes.EnsureSuccessStatusCode();
        var reviewJson = await reviewRes.Content.ReadFromJsonAsync<JsonElement>();
        var reviewId = reviewJson.GetProperty("id").GetGuid();

        // 3. Customer fetches reviews for the service plan (should not see unapproved review)
        var fetchReviewsRes1 = await Client.GetAsync($"/api/reviews/service-plan/{planId}");
        fetchReviewsRes1.EnsureSuccessStatusCode();
        var reviewsList1 = await fetchReviewsRes1.Content.ReadFromJsonAsync<JsonElement>();
        reviewsList1.GetArrayLength().Should().Be(0);

        // 4. Admin approves and features the review
        SetAuthToken(adminToken);
        var approveRes = await Client.PatchAsync($"/api/reviews/{reviewId}/approve", null);
        approveRes.EnsureSuccessStatusCode();

        var featureCmd = new FeatureTestimonialCommand { IsFeatured = true };
        var featureRes = await Client.PatchAsJsonAsync($"/api/reviews/{reviewId}/feature", featureCmd);
        featureRes.EnsureSuccessStatusCode();

        // 5. Admin can list all reviews
        var allReviewsRes = await Client.GetAsync("/api/reviews");
        allReviewsRes.EnsureSuccessStatusCode();
        var allReviewsList = await allReviewsRes.Content.ReadFromJsonAsync<JsonElement>();
        allReviewsList.GetArrayLength().Should().BeGreaterThan(0);

        // 6. Anonymous (or Customer) can see the approved review for the service plan
        SetAuthToken(customerToken);
        var fetchReviewsRes2 = await Client.GetAsync($"/api/reviews/service-plan/{planId}");
        fetchReviewsRes2.EnsureSuccessStatusCode();
        var reviewsList2 = await fetchReviewsRes2.Content.ReadFromJsonAsync<JsonElement>();
        reviewsList2.GetArrayLength().Should().Be(1);
        reviewsList2[0].GetProperty("comment").GetString().Should().Be("Great service!");
        reviewsList2[0].GetProperty("isApproved").GetBoolean().Should().BeTrue();
        reviewsList2[0].GetProperty("isFeatured").GetBoolean().Should().BeTrue();
    }
}
