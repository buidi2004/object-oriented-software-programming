using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;
using CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class DomainSslE2ETests : BaseE2ETest
{
    public DomainSslE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task DomainRegistrationAndSslWorkflow_ShouldSucceed()
    {
        // 1. Setup Data & User
        var token = await RegisterAndLoginCustomerAsync("domain_customer@test.com", "Password123!");
        
        // Need to get the UserId to attach to the OrderRequest.
        // We know from BaseE2ETest that our register API probably returns the UserId in the location header or response. 
        // For simplicity, we'll find the user by email in the DB or just mock the OrderRequest with a default Guid if we don't care, 
        // but OrderRequest requires UserId. Let's just create an OrderRequest using `AddEntityAsync` and fetch the user.
        var category = new ServiceCategory();
        category.Id = Guid.NewGuid();
        category.Name = "Domain Category";
        category.Slug = "domains";
        await AddEntityAsync(category);

        var plan = new ServicePlan(category.Id, "Domain Plan", null, null, null, null, null);
        await AddEntityAsync(plan);

        var user = await GetUserByEmailAsync("domain_customer@test.com");
        
        var orderItems = new System.Collections.Generic.List<OrderItem> { new OrderItem(plan.Id, BillingCycle.Monthly, 1, 15m) };
        var order = new OrderRequest(user.Id, orderItems, null, 0, 15m, false);
        order.Pay();
        await AddEntityAsync(order);

        // 2. Search Domain Availability
        var domainName = "my-awesome-startup.com";
        var checkResponse = await Client.GetAsync($"/api/domains/check?name={domainName}");
        if (!checkResponse.IsSuccessStatusCode)
        {
            var err = await checkResponse.Content.ReadAsStringAsync();
            throw new Exception($"Check domain failed: {err}");
        }
        var checkResult = await checkResponse.Content.ReadFromJsonAsync<CheckDomainResultDto>();
        checkResult!.IsAvailable.Should().BeTrue();

        // 3. Register Domain
        var registerCommand = new RegisterDomainCommand(domainName, order.Id);
        var registerResponse = await Client.PostAsJsonAsync("/api/domains", registerCommand);
        if (!registerResponse.IsSuccessStatusCode)
        {
            var err = await registerResponse.Content.ReadAsStringAsync();
            throw new Exception($"Register domain failed: {err}");
        }
        var registerResult = await registerResponse.Content.ReadFromJsonAsync<RegisterDomainResultDto>();
        registerResult!.DomainId.Should().NotBeEmpty();

        // 4. Verify Domain appears in Dashboard
        var myDomainsResponse = await Client.GetAsync("/api/domains/me");
        if (!myDomainsResponse.IsSuccessStatusCode)
        {
            var err = await myDomainsResponse.Content.ReadAsStringAsync();
            throw new Exception($"Get domains failed: {err}");
        }
        var myDomainsResult = await myDomainsResponse.Content.ReadAsStringAsync();
        myDomainsResult.Should().Contain(domainName);

        // 5. Request SSL Certificate
        var sslCommand = new RequestSslCertificateCommand(registerResult.DomainId, "-----BEGIN CERTIFICATE REQUEST-----...-----END CERTIFICATE REQUEST-----");
        var sslResponse = await Client.PostAsJsonAsync("/api/ssl", sslCommand);
        sslResponse.EnsureSuccessStatusCode();
        var sslResult = await sslResponse.Content.ReadFromJsonAsync<RequestSslResultDto>();
        sslResult!.SslId.Should().NotBeEmpty();

        // 6. Verify SSL linking
        var mySslsResponse = await Client.GetAsync("/api/ssl");
        mySslsResponse.EnsureSuccessStatusCode();
        var mySslsResult = await mySslsResponse.Content.ReadAsStringAsync();
        mySslsResult.Should().Contain(registerResult.DomainId.ToString());

        // 7. Add DNS Record
        var addDnsCmd = new CloudServiceStore.Application.Features.Domains.Commands.AddDnsRecord.AddDnsRecordCommand(registerResult.DomainId, "A", "www", "192.168.1.1", 3600);
        var dnsRes = await Client.PostAsJsonAsync($"/api/domains/{registerResult.DomainId}/dns", addDnsCmd);
        dnsRes.EnsureSuccessStatusCode();

        // 8. Get DNS Records
        var getDnsRes = await Client.GetAsync($"/api/domains/{registerResult.DomainId}/dns");
        getDnsRes.EnsureSuccessStatusCode();
        var dnsJson = await getDnsRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        var dnsArray = GetItemsArray(dnsJson);
        dnsArray.GetArrayLength().Should().BeGreaterThan(0);
        var dnsId = dnsArray[0].GetProperty("id").GetGuid();

        // 9. Delete DNS Record
        var delDnsRes = await Client.DeleteAsync($"/api/domains/{registerResult.DomainId}/dns/{dnsId}");
        delDnsRes.EnsureSuccessStatusCode();

        // 10. SslCertificatesController coverage
        var requestCertCmd = new RequestSslCertificateCommand(registerResult.DomainId, "-----BEGIN CERTIFICATE REQUEST-----...-----END CERTIFICATE REQUEST-----");
        var reqCertRes = await Client.PostAsJsonAsync("/api/ssl-certificates/certificates", requestCertCmd);
        reqCertRes.EnsureSuccessStatusCode();
        var reqCertJson = await reqCertRes.Content.ReadFromJsonAsync<dynamic>();
        string certId = reqCertJson?.GetProperty("certificateId").GetString();

        // 13. Customer gets all certificates
        var getCertsRes = await Client.GetAsync("/api/ssl-certificates/certificates");
        getCertsRes.EnsureSuccessStatusCode();

        var getCertIdRes = await Client.GetAsync($"/api/ssl-certificates/certificates/{certId}");
        getCertIdRes.EnsureSuccessStatusCode();
    }

    private class CheckDomainResultDto
    {
        public bool IsAvailable { get; set; }
    }

    private class RegisterDomainResultDto
    {
        public Guid DomainId { get; set; }
    }

    private class RequestSslResultDto
    {
        public Guid SslId { get; set; }
    }

    private async Task<AppUser> GetUserByEmailAsync(string email)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstAsync(db.AppUsers, u => u.Email == email);
    }
}
