using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.HostingAccounts.Commands.CreateHostingAccount
{
    public class CreateHostingAccountCommandTests
    {
        [Fact]
        public void HostingPlan_ShouldHaveCorrectProperties()
        {
            var plan = new HostingPlan
            {
                Name = "Basic Hosting",
                Price = 9.99m,
                DiskGb = 10,
                BandwidthGb = 100,
                MaxUsers = 5
            };

            plan.Name.Should().Be("Basic Hosting");
            plan.Price.Should().Be(9.99m);
            plan.DiskGb.Should().Be(10);
            plan.IsActive.Should().BeTrue();
        }

        [Fact]
        public void HostingAccount_ShouldHaveCorrectDefaults()
        {
            var account = new HostingAccount
            {
                UserId = System.Guid.NewGuid(),
                PlanId = System.Guid.NewGuid()
            };

            account.ContainerId.Should().BeEmpty();
            account.IsActive.Should().BeTrue();
            account.CreatedAt.Should().BeCloseTo(System.DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }
    }
}
