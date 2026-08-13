using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Domains.Commands.AddDnsRecord;
using CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class DomainsIntegrationTests : BaseIntegrationTest
{
    public DomainsIntegrationTests(CustomWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Manage_Domains_And_Dns_ShouldSucceed()
    {
        // 1. Arrange Customer
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        AuthenticateCustomer();

        // 2. Check Domain
        var checkResponse = await Client.GetAsync("/api/domains/check?name=example.com");
        checkResponse.EnsureSuccessStatusCode();

        // 2.5 Ensure ServicePlan and Order exists
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

        // 3. Register Domain
        var registerCommand = new RegisterDomainCommand("example.com", orderId);
        var registerResponse = await Client.PostAsJsonAsync("/api/domains", registerCommand);
        registerResponse.EnsureSuccessStatusCode();
        var registerContent = await registerResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var domainId = registerContent.GetProperty("domainId").GetGuid();

        // 4. Add DNS Record
        var addDnsCommand = new AddDnsRecordCommand(domainId, "A", "www", "192.168.1.1", 3600);
        var addDnsResponse = await Client.PostAsJsonAsync($"/api/domains/{domainId}/dns", addDnsCommand);
        addDnsResponse.EnsureSuccessStatusCode();
        var addDnsContent = await addDnsResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var recordId = addDnsContent.GetProperty("recordId").GetGuid();

        // 5. Get DNS Records
        var getDnsResponse = await Client.GetAsync($"/api/domains/{domainId}/dns");
        getDnsResponse.EnsureSuccessStatusCode();
        var getDnsContent = await getDnsResponse.Content.ReadAsStringAsync();
        getDnsContent.Should().Contain("192.168.1.1");

        // 6. Delete DNS Record
        var deleteDnsResponse = await Client.DeleteAsync($"/api/domains/{domainId}/dns/{recordId}");
        deleteDnsResponse.EnsureSuccessStatusCode();
    }
}
