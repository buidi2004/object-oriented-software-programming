using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.CdnDistribution.Commands.CreateCdnDistribution
{
    public class CreateCdnDistributionCommandTests
    {
        [Fact]
        public void CdnProvider_ShouldHaveCorrectValues()
        {
            CdnProvider.Cloudflare.Should().Be(CdnProvider.Cloudflare);
            CdnProvider.Fastly.Should().Be(CdnProvider.Fastly);
        }

        [Fact]
        public void CreateCdnDistributionCommand_ShouldHaveCorrectProperties()
        {
            var command = new CloudServiceStore.Application.Features.CdnDistribution.Commands.CreateCdnDistribution.CreateCdnDistributionCommand(
                "https://example.com",
                CdnProvider.Cloudflare
            );

            command.OriginUrl.Should().Be("https://example.com");
            command.Provider.Should().Be(CdnProvider.Cloudflare);
        }
    }
}
