using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.StaticSites.Commands.CreateStaticSite
{
    public class CreateStaticSiteCommandTests
    {
        [Fact]
        public void StaticSite_ShouldHaveCorrectProperties()
        {
            var site = new StaticSite
            {
                UserId = Guid.NewGuid(),
                Name = "My Site",
                BuildCommand = "npm run build",
                OutputDirectory = "dist"
            };

            site.Name.Should().Be("My Site");
            site.BuildCommand.Should().Be("npm run build");
            site.IsActive.Should().BeTrue();
            site.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }
    }
}
