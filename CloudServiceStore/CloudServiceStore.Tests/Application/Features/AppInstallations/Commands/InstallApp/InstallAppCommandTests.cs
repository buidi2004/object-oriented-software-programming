using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.AppInstallations.Commands.InstallApp
{
    public class InstallAppCommandTests
    {
        [Fact]
        public void AppInstallation_ShouldHaveCorrectDefaults()
        {
            var installation = new AppInstallation
            {
                UserId = System.Guid.NewGuid(),
                TemplateId = System.Guid.NewGuid(),
                HostingAccountId = System.Guid.NewGuid()
            };

            installation.ContainerId.Should().BeEmpty();
            installation.IsActive.Should().BeTrue();
            installation.CreatedAt.Should().BeCloseTo(System.DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void AppTemplate_ShouldHaveCorrectProperties()
        {
            var template = new AppTemplate
            {
                Name = "WordPress",
                DockerImage = "wordpress:latest",
                Category = "CMS",
                Price = 0,
                IsFree = true
            };

            template.Name.Should().Be("WordPress");
            template.IsFree.Should().BeTrue();
            template.IsActive.Should().BeTrue();
        }
    }
}
