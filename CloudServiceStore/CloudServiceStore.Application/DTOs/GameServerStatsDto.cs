using System;

namespace CloudServiceStore.Application.DTOs;

public class GameServerStatsDto
{
    public double CpuPercentage { get; set; }
    public double MemoryUsageMb { get; set; }
    public double MemoryLimitMb { get; set; }
    public bool IsRunning { get; set; }
}
