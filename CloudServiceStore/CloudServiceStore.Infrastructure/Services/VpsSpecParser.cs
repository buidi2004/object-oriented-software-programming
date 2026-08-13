using System.Globalization;
using System.Text.RegularExpressions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Services;

public partial class VpsSpecParser : IVpsSpecParser
{
    public (int CpuCores, long MemoryBytes, int? DiskGb) Parse(ServicePlan plan)
    {
        var cpuCores = ParseCpu(plan.Cpu) ?? 1;
        var memoryBytes = ParseRam(plan.Ram) ?? 512L * 1024 * 1024;
        var diskGb = ParseDisk(plan.Ssd);
        return (cpuCores, memoryBytes, diskGb);
    }

    private static int? ParseCpu(string? cpu)
    {
        if (string.IsNullOrWhiteSpace(cpu)) return null;
        var match = CpuRegex().Match(cpu);
        return match.Success ? int.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture) : null;
    }

    private static long? ParseRam(string? ram)
    {
        if (string.IsNullOrWhiteSpace(ram)) return null;

        var unitMatch = RamUnitRegex().Match(ram);
        if (unitMatch.Success)
        {
            var value = double.Parse(unitMatch.Groups[1].Value, CultureInfo.InvariantCulture);
            var unit = unitMatch.Groups[2].Value.ToUpperInvariant();
            return unit switch
            {
                "TB" => (long)(value * 1024 * 1024 * 1024 * 1024),
                "GB" => (long)(value * 1024 * 1024 * 1024),
                "MB" => (long)(value * 1024 * 1024),
                _ => (long)(value * 1024 * 1024)
            };
        }

        var numberMatch = NumberRegex().Match(ram);
        if (numberMatch.Success)
        {
            return long.Parse(numberMatch.Groups[1].Value, CultureInfo.InvariantCulture) * 1024 * 1024;
        }

        return null;
    }

    private static int? ParseDisk(string? ssd)
    {
        if (string.IsNullOrWhiteSpace(ssd)) return null;
        var match = DiskRegex().Match(ssd);
        return match.Success ? int.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture) : null;
    }

    [GeneratedRegex(@"(\d+)", RegexOptions.IgnoreCase)]
    private static partial Regex CpuRegex();

    [GeneratedRegex(@"(\d+(?:\.\d+)?)\s*(TB|GB|MB)", RegexOptions.IgnoreCase)]
    private static partial Regex RamUnitRegex();

    [GeneratedRegex(@"(\d+)", RegexOptions.IgnoreCase)]
    private static partial Regex NumberRegex();

    [GeneratedRegex(@"(\d+)\s*GB", RegexOptions.IgnoreCase)]
    private static partial Regex DiskRegex();
}
