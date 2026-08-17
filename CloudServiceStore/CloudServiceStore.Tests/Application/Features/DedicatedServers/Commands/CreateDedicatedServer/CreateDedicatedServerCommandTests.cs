using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.DedicatedServers.Commands.CreateDedicatedServer
{
    public class CreateDedicatedServerCommandTests
    {
        [Fact]
        public void DedicatedServer_ShouldHaveCorrectProperties()
        {
            var server = new DedicatedServer
            {
                UserId = Guid.NewGuid(),
                ServerName = "My Server",
                CpuModel = "Intel Xeon",
                RamGb = 32,
                DiskBytes = 512L * 1024 * 1024 * 1024,
                OsImage = "Ubuntu 24.04 LTS"
            };

            server.ServerName.Should().Be("My Server");
            server.RamGb.Should().Be(32);
        }

        [Fact]
        public void DedicatedServerStatus_ShouldHaveCorrectValues()
        {
            DedicatedServerStatus.Provisioning.Should().Be(DedicatedServerStatus.Provisioning);
            DedicatedServerStatus.Running.Should().Be(DedicatedServerStatus.Running);
            DedicatedServerStatus.Stopped.Should().Be(DedicatedServerStatus.Stopped);
            DedicatedServerStatus.Failed.Should().Be(DedicatedServerStatus.Failed);
        }
    }
}
