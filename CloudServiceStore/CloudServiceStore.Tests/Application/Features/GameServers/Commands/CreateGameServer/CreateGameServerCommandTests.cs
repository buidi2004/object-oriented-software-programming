using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.GameServers.Commands.CreateGameServer
{
    public class CreateGameServerCommandTests
    {
        [Fact]
        public void GameServerInstance_ShouldHaveCorrectDefaults()
        {
            var server = new GameServerInstance
            {
                UserId = System.Guid.NewGuid(),
                GameType = GameType.Minecraft
            };

            server.ContainerId.Should().BeEmpty();
            server.Status.Should().Be(GameServerStatus.Creating);
            server.IsActive.Should().BeTrue();
        }

        [Fact]
        public void GameServerInstance_ShouldSupportAllGameTypes()
        {
            ((int)GameType.Minecraft).Should().Be(1);
            ((int)GameType.CS2).Should().Be(2);
            ((int)GameType.Ark).Should().Be(3);
            ((int)GameType.Rust).Should().Be(4);
        }
    }
}
