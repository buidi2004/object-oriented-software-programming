using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;
using CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;
using CloudServiceStore.Application.Features.Roles.Commands.CreateRole;
using CloudServiceStore.Application.Features.Security.Commands.ChangePassword;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ValidationAndBadRequestsE2ETests : BaseE2ETest
{
    public ValidationAndBadRequestsE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Theory]
    [InlineData("InvalidEmail", "Password123!", "FullName")]
    [InlineData("test@example.com", "123", "FullName")]
    [InlineData("test@example.com", "passwordwithoutupper123", "FullName")]
    [InlineData("test@example.com", "Password123!", "")]
    public async Task Register_WithInvalidFields_MustReturn400ProblemDetails(string email, string password, string fullName)
    {
        var command = new RegisterCommand(fullName, email, password, "0123456789");
        var response = await Client.PostAsJsonAsync("/api/auth/register", command);

        await response.ShouldBeProblemDetailsAsync(HttpStatusCode.BadRequest, "Bad Request");
    }

    [Theory]
    [InlineData("", "valid-slug")]
    [InlineData("Database Servers", "INVALID SLUG WITH SPACES")]
    [InlineData("Database Servers", "invalid_slug_with_underscores")]
    public async Task CreateCategory_WithInvalidData_MustReturn400ProblemDetails(string name, string slug)
    {
        var adminToken = await RegisterAndLoginAdminAsync($"admin_{Guid.NewGuid():N}@test.com", "Admin@123!");
        SetAuthToken(adminToken);

        var command = new CreateCategoryCommand(name, slug);
        var response = await Client.PostAsJsonAsync("/api/categories", command);

        await response.ShouldBeProblemDetailsAsync(HttpStatusCode.BadRequest, "Bad Request");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(150)]
    public async Task CreatePromotion_WithInvalidDiscountPercentage_MustReturn400ProblemDetails(decimal discountPercent)
    {
        var adminToken = await RegisterAndLoginAdminAsync($"admin_{Guid.NewGuid():N}@test.com", "Admin@123!");
        SetAuthToken(adminToken);

        var command = new CreatePromotionCommand(Guid.NewGuid(), discountPercent, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));
        var response = await Client.PostAsJsonAsync("/api/promotions", command);

        await response.ShouldBeProblemDetailsAsync(HttpStatusCode.BadRequest, "Bad Request");
    }

    [Theory]
    [InlineData("CurrentPass1!", "123")] // Too short
    [InlineData("CurrentPass1!", "nourcaseorspecial123")] // No upper/special
    [InlineData("CurrentPass1!", "CurrentPass1!")] // Same as current
    public async Task ChangePassword_WithWeakOrIdenticalPassword_MustReturn400ProblemDetails(string currentPassword, string newPassword)
    {
        var email = $"user_{Guid.NewGuid():N}@test.com";
        var token = await RegisterAndLoginCustomerAsync(email, currentPassword);
        SetAuthToken(token);

        var command = new ChangePasswordCommand(currentPassword, newPassword);
        var response = await Client.PostAsJsonAsync("/api/security/change-password", command);

        await response.ShouldBeProblemDetailsAsync(HttpStatusCode.BadRequest, "Bad Request");
    }

    [Theory]
    [InlineData("", "Answer content", "General")]
    [InlineData("Question?", "", "General")]
    public async Task CreateFaq_WithEmptyRequiredFields_MustReturn400ProblemDetails(string question, string answer, string category)
    {
        var adminToken = await RegisterAndLoginAdminAsync($"admin_{Guid.NewGuid():N}@test.com", "Admin@123!");
        SetAuthToken(adminToken);

        var command = new CreateFaqItemCommand(question, answer, category, 1);
        var response = await Client.PostAsJsonAsync("/api/faqs", command);

        await response.ShouldBeProblemDetailsAsync(HttpStatusCode.BadRequest, "Bad Request");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateRole_WithEmptyName_MustReturn400ProblemDetails(string roleName)
    {
        var adminToken = await RegisterAndLoginAdminAsync($"admin_{Guid.NewGuid():N}@test.com", "Admin@123!");
        SetAuthToken(adminToken);

        var command = new CreateRoleCommand(roleName);
        var response = await Client.PostAsJsonAsync("/api/roles", command);

        await response.ShouldBeProblemDetailsAsync(HttpStatusCode.BadRequest, "Bad Request");
    }
}
