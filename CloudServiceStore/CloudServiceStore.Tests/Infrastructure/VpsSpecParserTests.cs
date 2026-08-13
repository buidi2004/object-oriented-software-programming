using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Infrastructure;

public class VpsSpecParserTests
{
    private readonly VpsSpecParser _parser = new();

    [Theory]
    [InlineData("2 Core", "4GB", "40GB NVMe", 2, 4096, 40)]
    [InlineData("8 vCPU", "16GB", "160GB NVMe", 8, 16384, 160)]
    [InlineData("1 Core", "512MB", "10GB", 1, 512, 10)]
    public void Parse_ShouldMapPlanStrings(
        string cpu,
        string ram,
        string ssd,
        int expectedCpu,
        int expectedRamMb,
        int expectedDiskGb)
    {
        var plan = new ServicePlan(Guid.NewGuid(), "Test Plan", cpu, ram, ssd, "Unlimited", null);

        var (cpuCores, memoryBytes, diskGb) = _parser.Parse(plan);

        cpuCores.Should().Be(expectedCpu);
        (memoryBytes / (1024 * 1024)).Should().Be(expectedRamMb);
        diskGb.Should().Be(expectedDiskGb);
    }
}
