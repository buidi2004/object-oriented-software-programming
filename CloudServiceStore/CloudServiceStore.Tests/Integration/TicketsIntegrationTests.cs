using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class TicketsIntegrationTests : BaseIntegrationTest
{
    public TicketsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Create_And_ManageTicket_ShouldSucceed()
    {
        // 1. Arrange User
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);

        // 2. Act: Customer creates ticket
        AuthenticateCustomer();
        var createCommand = new CreateTicketCommand("Help me with my VPS", TicketPriority.High);
        var createResponse = await Client.PostAsJsonAsync("/api/tickets", createCommand);
        createResponse.EnsureSuccessStatusCode();
        var createContent = await createResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var ticketId = createContent.GetProperty("id").GetGuid();

        // 3. Act: Admin replies to ticket
        AuthenticateAdmin();
        var replyBody = new { Message = "We are looking into it." };
        var replyResponse = await Client.PostAsJsonAsync($"/api/tickets/{ticketId}/messages", replyBody);
        if (!replyResponse.IsSuccessStatusCode)
        {
            var err = await replyResponse.Content.ReadAsStringAsync();
            throw new Exception($"Failed with status {replyResponse.StatusCode}. Body: {err}");
        }

        // 4. Act: Customer closes ticket
        AuthenticateCustomer();
        var closeResponse = await Client.PatchAsync($"/api/tickets/{ticketId}/close", null);
        closeResponse.EnsureSuccessStatusCode();

        // 5. Assert: Customer gets their tickets
        var getMyTicketsResponse = await Client.GetAsync("/api/tickets/me");
        getMyTicketsResponse.EnsureSuccessStatusCode();
        var getMyTicketsContent = await getMyTicketsResponse.Content.ReadAsStringAsync();
        getMyTicketsContent.Should().Contain(ticketId.ToString());
    }
}
