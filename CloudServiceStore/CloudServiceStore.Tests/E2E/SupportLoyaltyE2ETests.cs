using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Loyalty.Commands.RedeemLoyalty;
using CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.WebApi.Controllers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class SupportLoyaltyE2ETests : BaseE2ETest
{
    public SupportLoyaltyE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task SupportAndLoyaltyWorkflow_ShouldSucceed()
    {
        // 1. Customer logs in
        var customerEmail = "support_customer@test.com";
        var customerToken = await RegisterAndLoginCustomerAsync(customerEmail, "Password123!");

        // 2. Customer creates a support ticket
        var createTicketCommand = new CreateTicketCommand("Server is down!", TicketPriority.High);
        var createResponse = await Client.PostAsJsonAsync("/api/tickets", createTicketCommand);
        createResponse.EnsureSuccessStatusCode();

        var createResult = await createResponse.Content.ReadFromJsonAsync<CreateTicketResultDto>();
        createResult!.Id.Should().NotBeEmpty();
        var ticketId = createResult.Id;

        // 3. Customer adds a message to the ticket
        var customerMessage = new AddTicketMessageRequest("Please help, my website is offline.");
        var addMessageResponse = await Client.PostAsJsonAsync($"/api/tickets/{ticketId}/messages", customerMessage);
        addMessageResponse.EnsureSuccessStatusCode();

        // 4. Admin logs in
        var adminToken = await RegisterAndLoginAdminAsync("admin_support@test.com", "AdminPass123!");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

        // 5. Admin assigns ticket and replies
        var adminUser = await GetUserByEmailAsync("admin_support@test.com");
        var assignRequest = new AssignTicketRequest(adminUser.Id);
        var assignResponse = await Client.PatchAsJsonAsync($"/api/tickets/{ticketId}/assign", assignRequest);
        assignResponse.EnsureSuccessStatusCode();

        var adminMessage = new AddTicketMessageRequest("We have restarted your server. Very sorry for the downtime!");
        var adminMessageResponse = await Client.PostAsJsonAsync($"/api/tickets/{ticketId}/messages", adminMessage);
        adminMessageResponse.EnsureSuccessStatusCode();

        // 6. Admin closes the ticket
        var closeResponse = await Client.PatchAsync($"/api/tickets/{ticketId}/close", null);
        closeResponse.EnsureSuccessStatusCode();

        // 7. Admin grants loyalty points as an apology (Simulate DB update)
        var customerUser = await GetUserByEmailAsync(customerEmail);
        await GrantLoyaltyPointsAsync(customerUser.Id, 500); // Give 500 points

        // 8. Customer logs back in
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);

        // 9. Customer redeems loyalty points
        var redeemCommand = new RedeemLoyaltyCommand { PointsToRedeem = 500 };
        var redeemResponse = await Client.PostAsJsonAsync("/api/loyalty/redeem", redeemCommand);
        redeemResponse.EnsureSuccessStatusCode();

        // 10. Customer verifies Loyalty balance
        var loyaltyResponse = await Client.GetAsync("/api/loyalty/me");
        loyaltyResponse.EnsureSuccessStatusCode();
        var loyaltyResult = await loyaltyResponse.Content.ReadAsStringAsync();
        loyaltyResult.Should().Contain("\"points\":0");

        // 11. Customer checks their tickets
        var ticketsMeResponse = await Client.GetAsync("/api/tickets/me");
        ticketsMeResponse.EnsureSuccessStatusCode();
        var ticketsMeJson = await ticketsMeResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        ticketsMeJson.GetProperty("items").GetArrayLength().Should().BeGreaterThan(0);

        // 12. Admin checks the ticket queue
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var ticketsQueueResponse = await Client.GetAsync("/api/tickets/queue");
        ticketsQueueResponse.EnsureSuccessStatusCode();
        var ticketsQueueJson = await ticketsQueueResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        // Queue might be empty if it's closed, but it shouldn't 500
        ticketsQueueJson.TryGetProperty("items", out _).Should().BeTrue();
    }

    private class CreateTicketResultDto
    {
        public Guid Id { get; set; }
    }

    private async Task<string> RegisterAndLoginAdminAsync(string email, string password)
    {
        // Register standard user
        var registerCommand = new CloudServiceStore.Application.Features.Auth.Commands.Register.RegisterCommand("Admin User", email, password, "0987654321");
        await Client.PostAsJsonAsync("/api/auth/register", registerCommand);

        // Promote to admin in DB
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            var user = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == email);
            var adminRole = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.Roles, r => r.Name == "Admin");
            user.RoleId = adminRole.Id;
            await db.SaveChangesAsync();
        }

        // Login as admin
        var loginCommand = new CloudServiceStore.Application.Features.Auth.Commands.Login.LoginCommand(email, password, "127.0.0.1", "E2E Test", "Test Device");
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginCommand);
        loginResponse.EnsureSuccessStatusCode();

        var authResult = await loginResponse.Content.ReadFromJsonAsync<AuthResultDto>();
        return authResult!.AccessToken;
    }

    private class AuthResultDto
    {
        public string AccessToken { get; set; } = string.Empty;
    }

    private async Task<AppUser> GetUserByEmailAsync(string email)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == email);
    }

    private async Task GrantLoyaltyPointsAsync(Guid userId, int points)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
        var loyalty = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(db.Set<LoyaltyPoint>(), l => l.UserId == userId);
        if (loyalty == null)
        {
            loyalty = new LoyaltyPoint { Id = Guid.NewGuid(), UserId = userId, Points = points };
            db.Set<LoyaltyPoint>().Add(loyalty);
        }
        else
        {
            loyalty.Points += points;
        }
        await db.SaveChangesAsync();
    }
}
