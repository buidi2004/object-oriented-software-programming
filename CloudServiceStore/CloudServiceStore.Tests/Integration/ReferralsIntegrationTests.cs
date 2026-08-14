using System;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Referrals.Commands.ApplyReferralCode;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class ReferralsIntegrationTests : BaseIntegrationTest, IClassFixture<CustomWebApplicationFactory>
{
    public ReferralsIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetMyReferral_ShouldReturnData()
    {
        AuthenticateCustomer();
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);
        
        var referral = new ReferralCode { Id = Guid.NewGuid(), UserId = customerId, Code = "REF123" };
        await AddEntityAsync(referral);

        var response = await Client.GetAsync("/api/referrals/me");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ReferralCode>();
        result.Should().NotBeNull();
        result.Code.Should().Be("REF123");
    }

    [Fact]
    public async Task ApplyReferralCode_ShouldSucceed()
    {
        AuthenticateCustomer();
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        await SeedUserAsync(customerId);

        var referrerId = Guid.NewGuid();
        var customerRole = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
            Factory.Services.CreateScope().ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>().Roles, r => r.Name == "Customer");
        var referrer = new AppUser("Referrer", "referrer@test.com", "hash", customerRole!.Id) { Id = referrerId };
        await AddEntityAsync(referrer);
        
        var referral = new ReferralCode { Id = Guid.NewGuid(), UserId = referrerId, Code = "CODE123" };
        await AddEntityAsync(referral);

        var command = new ApplyReferralCodeCommand { Code = "CODE123" };
        var response = await Client.PostAsJsonAsync("/api/referrals/apply", command);
        response.EnsureSuccessStatusCode();
    }
}
