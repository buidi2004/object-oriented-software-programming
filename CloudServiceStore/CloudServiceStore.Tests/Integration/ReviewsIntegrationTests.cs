using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class ReviewsIntegrationTests : BaseIntegrationTest
{
    public ReviewsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task FeatureReview_ShouldSucceed()
    {
        AuthenticateAdmin();

        var userId = Guid.NewGuid();
        await SeedUserAsync(userId);
        var categoryId = Guid.NewGuid();
        var planId = Guid.NewGuid();
        await AddEntityAsync(new ServiceCategory { Id = categoryId, Name = "Cat R", Slug = "cat-r" });
        await AddEntityAsync(new ServicePlan(categoryId, "Plan R", null, null, null, null, null) { Id = planId });
        
        var reviewId = Guid.NewGuid();
        var review = new Review
        {
            Id = reviewId,
            UserId = userId,
            ServicePlanId = planId,
            Rating = 5,
            Comment = "Excellent",
            IsApproved = true,
            CreatedAt = DateTime.UtcNow,
            IsFeatured = false
        };
        await AddEntityAsync(review);

        var command = new FeatureTestimonialCommand { ReviewId = reviewId, IsFeatured = true };
        var response = await Client.PatchAsJsonAsync($"/api/reviews/{reviewId}/feature", command);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("true");
    }
}
