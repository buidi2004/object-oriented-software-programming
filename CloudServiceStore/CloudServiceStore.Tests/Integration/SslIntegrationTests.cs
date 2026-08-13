using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;
using CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class SslIntegrationTests : BaseIntegrationTest
{
    public SslIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Request_And_GetSslCertificate_ShouldSucceed()
    {
        // 1. Arrange Customer
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        AuthenticateCustomer();

        // 2. Register Domain
        var servicePlanId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var category = new CloudServiceStore.Domain.Entities.ServiceCategory { Id = categoryId, Name = "Hosting", Slug = "hosting" };
        await AddEntityAsync(category);

        var servicePlan = new CloudServiceStore.Domain.Entities.ServicePlan(categoryId, "Plan 1", "1 Core", "1GB", "10GB", "1TB", null);
        servicePlan.Id = servicePlanId;
        await AddEntityAsync(servicePlan);

        var orderId = Guid.NewGuid();
        var order = new CloudServiceStore.Domain.Entities.OrderRequest(
            customerId, 
            servicePlanId, 
            CloudServiceStore.Domain.Enums.BillingCycle.Monthly, 
            null, 
            0, 
            100);
        order.Id = orderId;
        order.Pay();
        await AddEntityAsync(order);

        var registerCommand = new RegisterDomainCommand("example-ssl.com", orderId);
        var registerResponse = await Client.PostAsJsonAsync("/api/domains", registerCommand);
        registerResponse.EnsureSuccessStatusCode();
        var registerContent = await registerResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var domainId = registerContent.GetProperty("domainId").GetGuid();

        // 3. Request SSL
        var requestCommand = new RequestSslCertificateCommand(domainId, "-----BEGIN CERTIFICATE REQUEST-----...");
        var requestResponse = await Client.PostAsJsonAsync("/api/ssl", requestCommand);
        requestResponse.EnsureSuccessStatusCode();
        var requestContent = await requestResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var sslId = requestContent.GetProperty("sslId").GetGuid();

        // 4. Get By ID
        var getResponse = await Client.GetAsync($"/api/ssl/{sslId}");
        getResponse.EnsureSuccessStatusCode();
        var getContent = await getResponse.Content.ReadAsStringAsync();
        getContent.Should().Contain(sslId.ToString());

        // 5. Get My SSL
        var getMyResponse = await Client.GetAsync("/api/ssl");
        getMyResponse.EnsureSuccessStatusCode();
        var getMyContent = await getMyResponse.Content.ReadAsStringAsync();
        getMyContent.Should().Contain(sslId.ToString());
    }
}
