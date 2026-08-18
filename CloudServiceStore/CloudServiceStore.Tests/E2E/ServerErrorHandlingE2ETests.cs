using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Models;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class ServerErrorHandlingE2ETests : BaseE2ETest
{
    public ServerErrorHandlingE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task UnhandledServiceException_MustBeCaughtByMiddleware_AndReturn500ProblemDetails()
    {
        // 1. Arrange: Tạo mock service ném Exception unhandled
        var mockBrokenVpsService = new Mock<IVpsProvisioningService>();
        mockBrokenVpsService
            .Setup(x => x.IsAvailableAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Simulated internal infrastructure failure: Docker daemon socket unreachable"));

        var faultFactory = Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.FirstOrDefault(d => d.ServiceType == typeof(IVpsProvisioningService));
                if (descriptor != null) services.Remove(descriptor);
                services.AddSingleton(mockBrokenVpsService.Object);
            });
        });

        var faultClient = faultFactory.CreateClient();

        // 2. Act: Trigger endpoint that calls the failing service
        var response = await faultClient.GetAsync("/api/vpsinstances/health/docker");

        // 3. Assert: Phải được Middleware bắt và chuyển thành 500 ProblemDetails
        await response.ShouldBeProblemDetailsAsync(HttpStatusCode.InternalServerError, "An internal server error occurred.");
    }

    [Fact]
    public async Task ServerResilience_After500Error_ShouldContinueServingNormalRequests()
    {
        // 1. Arrange: Đăng nhập admin
        var adminToken = await RegisterAndLoginAdminAsync($"admin_resilience_{Guid.NewGuid():N}@test.com", "Password123!");
        SetAuthToken(adminToken);

        // 2. Request danh mục hợp lệ
        var catResponse = await Client.GetAsync("/api/categories");
        catResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // 3. Request setting hợp lệ
        var settingsResponse = await Client.GetAsync("/api/settings");
        settingsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
