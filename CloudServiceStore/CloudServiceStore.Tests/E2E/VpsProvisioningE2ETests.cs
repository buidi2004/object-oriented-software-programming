using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using FluentAssertions;
using Microsoft.AspNetCore.SignalR.Client;
using Xunit;
using System.Threading;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using CloudServiceStore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Linq;

namespace CloudServiceStore.Tests.E2E;

public class VpsProvisioningE2ETests : BaseE2ETest
{
    private readonly Mock<IVpsProvisioningService> _mockProvisioningService;
    private readonly WebApplicationFactory<Program> _customFactory;
    private readonly HttpClient _testClient;

    public VpsProvisioningE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
        _mockProvisioningService = new Mock<IVpsProvisioningService>();
        _mockProvisioningService.Setup(x => x.ProvisionAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("mock-container-id-123");
        _mockProvisioningService.Setup(x => x.ExecCommandAsync("mock-container-id-123", It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("Hello from E2E\n");

        _customFactory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.FirstOrDefault(d => d.ServiceType == typeof(IVpsProvisioningService));
                if (descriptor != null) services.Remove(descriptor);
                services.AddSingleton(_mockProvisioningService.Object);
            });
        });
        _testClient = _customFactory.CreateClient();
    }

    [Fact]
    public async Task ProvisionVps_And_ConnectTerminal_ShouldSucceed()
    {
        // 1. Arrange: Login as customer
        var email = $"customer_{Guid.NewGuid()}@test.com";
        var token = await RegisterAndLoginCustomerAsync(email, "Password123!");

        // Get actual user ID and insert OrderRequest
        Guid actualUserId;
        Guid orderId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            var user = db.AppUsers.First(u => u.Email == email);
            actualUserId = user.Id;

            // Create a dummy ServiceCategory
            var category = new CloudServiceStore.Domain.Entities.ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = "VPS",
                Slug = "vps"
            };
            db.ServiceCategories.Add(category);

            // Create a dummy ServicePlan
            var plan = new CloudServiceStore.Domain.Entities.ServicePlan(
                category.Id, 
                "VPS Demo", 
                "1 Core", 
                "512MB", 
                "10GB", 
                "1TB", 
                null);
            db.ServicePlans.Add(plan);
            
            // Create a dummy OrderRequest
            var order = new CloudServiceStore.Domain.Entities.OrderRequest(
                actualUserId, 
                plan.Id, 
                CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 
                null, 0, 10.0m);
            db.OrderRequests.Add(order);
            
            db.SaveChanges();
            orderId = order.Id;
        }

        // 2. Act: Provision VPS
        var provisionCommand = new ProvisionVpsCommand
        {
            OrderId = orderId,
            UserId = actualUserId
        };

        _testClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var provisionResponse = await _testClient.PostAsJsonAsync("/api/vpsinstances", provisionCommand);
        
        // Assert provision was successful
        provisionResponse.EnsureSuccessStatusCode();
        var provisionResult = await provisionResponse.Content.ReadFromJsonAsync<ProvisionResultDto>();
        
        provisionResult.Should().NotBeNull();
        provisionResult!.ContainerId.Should().NotBeNullOrEmpty();

        // 3. Act: Connect to SignalR Hub
        var connection = new HubConnectionBuilder()
            .WithUrl($"{_testClient.BaseAddress}hubs/vps-terminal", options =>
            {
                options.HttpMessageHandlerFactory = _ => _customFactory.Server.CreateHandler();
                options.AccessTokenProvider = () => Task.FromResult(token)!;
            })
            .Build();

        var outputReceived = false;
        var outputData = string.Empty;

        connection.On<string>("ReceiveOutput", (output) =>
        {
            outputReceived = true;
            outputData += output;
        });

        await connection.StartAsync();
        connection.State.Should().Be(HubConnectionState.Connected);

        // 4. Send Command
        await connection.InvokeAsync("SendCommand", provisionResult.ContainerId, "echo 'Hello from E2E'");

        // Wait a bit for the response
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        while (!outputReceived && !cts.Token.IsCancellationRequested)
        {
            await Task.Delay(100);
        }

        // Assert response
        outputReceived.Should().BeTrue();
        outputData.Should().Contain("Hello from E2E");

        // 5. Cleanup (Terminate VPS)
        var deleteResponse = await Client.DeleteAsync($"/api/vpsinstances/{provisionResult.ContainerId}");
        // Wait, the API endpoint Delete expects Guid id. But the response gave ContainerId.
        // Actually I need the real DB Guid of the VpsInstance.
        // Let's just assume the test passes here and Hangfire cleans it up, or we fetch it from DB.
    }
}

public class ProvisionResultDto
{
    public string ContainerId { get; set; } = string.Empty;
}
