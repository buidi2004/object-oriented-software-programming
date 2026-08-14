using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using CloudServiceStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Tests.E2E;

public class RegistrationE2ETests : BaseE2ETest
{
    public RegistrationE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task FullRegistration_WithAllFields_ShouldCreateUserAndSubscriber()
    {
        // Arrange
        var command = new RegisterCommand(
            FullName: "Nguyễn Văn A",
            Email: "nguyenvana@example.com",
            Password: "Password123!",
            PhoneNumber: "0901234567",
            FirstName: "A",
            LastName: "Nguyễn Văn",
            Country: "Viet Nam",
            City: "Hồ Chí Minh",
            Ward: "Phường 1",
            AddressLine: "123 Đường ABC",
            CompanyName: "Công ty TNHH ABC",
            TaxCode: "1234567890",
            SubscribeNewsletter: true
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", command);

        // Assert
        response.EnsureSuccessStatusCode();

        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = await db.AppUsers.FirstOrDefaultAsync(u => u.Email == command.Email);
        user.Should().NotBeNull();
        user!.FirstName.Should().Be("A");
        user.LastName.Should().Be("Nguyễn Văn");
        user.Country.Should().Be("Viet Nam");
        user.City.Should().Be("Hồ Chí Minh");
        user.Ward.Should().Be("Phường 1");
        user.AddressLine.Should().Be("123 Đường ABC");
        user.CompanyName.Should().Be("Công ty TNHH ABC");
        user.TaxCode.Should().Be("1234567890");

        var subscriber = await db.NewsletterSubscribers.FirstOrDefaultAsync(s => s.Email == command.Email);
        subscriber.Should().NotBeNull();
        subscriber!.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task Registration_WithDuplicateEmail_ShouldReturnConflict()
    {
        // Arrange
        var command1 = new RegisterCommand("User One", "duplicate@example.com", "Password123!", "0901234567");
        await Client.PostAsJsonAsync("/api/auth/register", command1);

        var command2 = new RegisterCommand("User Two", "duplicate@example.com", "Password123!", "0909999999");

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", command2);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task RefreshToken_WithValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var (accessToken, refreshToken) = await RegisterAndLoginCustomerWithRefreshAsync($"refresh_{Guid.NewGuid():N}@example.com", "Password123!");

        var command = new CloudServiceStore.Application.Features.Auth.Commands.RefreshToken.RefreshTokenCommand(refreshToken);

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/refresh-token", command);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<AuthResultDto>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeEmpty();
        result.RefreshToken.Should().NotBeEmpty();
        result.AccessToken.Should().NotBe(accessToken);
    }
}
