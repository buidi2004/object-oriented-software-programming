using System;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using CloudServiceStore.Application.Models;
using FluentAssertions;
using Microsoft.AspNetCore.SignalR.Client;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using CloudServiceStore.Application.Interfaces;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Linq;
using System.Reflection;
using CloudServiceStore.Application.DTOs;

namespace CloudServiceStore.Tests.E2E;

public class VpsProvisioningE2ETests : BaseE2ETest
{
    private readonly Mock<IVpsProvisioningService> _mockProvisioningService;
    private readonly WebApplicationFactory<Program> _customFactory;
    private readonly HttpClient _testClient;

    public VpsProvisioningE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
        _mockProvisioningService = new Mock<IVpsProvisioningService>();
        _mockProvisioningService.Setup(x => x.ProvisionAsync(It.IsAny<VpsProvisionSpec>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ProvisionResult(true, "mock-container-id-123", "vps-mock-test", null));
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
        var email = $"customer_{Guid.NewGuid()}@test.com";
        var token = await RegisterAndLoginCustomerAsync(email, "Password123!");

        Guid actualUserId;
        Guid orderId;
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            var user = db.AppUsers.First(u => u.Email == email);
            actualUserId = user.Id;

            var category = new CloudServiceStore.Domain.Entities.ServiceCategory
            {
                Id = Guid.NewGuid(),
                Name = "Cloud VPS",
                Slug = "cloud-vps"
            };
            db.ServiceCategories.Add(category);

            var plan = new CloudServiceStore.Domain.Entities.ServicePlan(
                category.Id,
                "VPS Demo",
                "2 Core",
                "4GB",
                "40GB",
                "1TB",
                null);
            db.ServicePlans.Add(plan);

            var order = new CloudServiceStore.Domain.Entities.OrderRequest(
                actualUserId,
                plan.Id,
                CloudServiceStore.Domain.Enums.BillingCycle.Monthly,
                null, 0, 10.0m);
            order.Pay();
            typeof(CloudServiceStore.Domain.Entities.OrderRequest)
                .GetProperty("ServicePlan", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)!
                .SetValue(order, plan);

            db.OrderRequests.Add(order);
            db.SaveChanges();
            orderId = order.Id;
        }

        var provisionCommand = new ProvisionVpsCommand
        {
            OrderId = orderId
        };

        _testClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var provisionResponse = await _testClient.PostAsJsonAsync("/api/vpsinstances", provisionCommand);

        provisionResponse.EnsureSuccessStatusCode();
        var provisionResult = await provisionResponse.Content.ReadFromJsonAsync<VpsInstanceDto>();

        provisionResult.Should().NotBeNull();
        provisionResult!.ContainerId.Should().NotBeNullOrEmpty();

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

        await connection.InvokeAsync("SendCommand", provisionResult.ContainerId, "echo 'Hello from E2E'");

        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        while (!outputReceived && !cts.Token.IsCancellationRequested)
        {
            await Task.Delay(100);
        }

        outputReceived.Should().BeTrue();
        outputData.Should().Contain("Hello from E2E");
    }
}
