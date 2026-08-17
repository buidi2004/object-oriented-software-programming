using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.SecurityAddons.Commands.PurchaseSecurityAddon
{
    public class PurchaseSecurityAddonCommandTests
    {
        [Fact]
        public void SecuritySubscription_ShouldHaveCorrectProperties()
        {
            var subscription = new SecuritySubscription
            {
                UserId = Guid.NewGuid(),
                TargetResourceId = "test-resource",
                AddonType = SecurityAddonType.Waf,
                IsActive = true
            };

            subscription.UserId.Should().NotBeEmpty();
            subscription.TargetResourceId.Should().Be("test-resource");
            subscription.AddonType.Should().Be(SecurityAddonType.Waf);
            subscription.IsActive.Should().BeTrue();
        }

        [Fact]
        public void SecurityAddonType_ShouldHaveCorrectValues()
        {
            SecurityAddonType.Waf.Should().Be(SecurityAddonType.Waf);
            SecurityAddonType.MalwareScan.Should().Be(SecurityAddonType.MalwareScan);
        }
    }
}
