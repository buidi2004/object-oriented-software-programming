namespace CloudServiceStore.Application.Models;

public record VpsProvisionSpec(
    string ContainerName,
    int CpuCores,
    long MemoryBytes,
    int? DiskGb,
    string ImageName = "vps-demo-image");

public record ProvisionResult(
    bool Success,
    string ContainerId,
    string ContainerName,
    string? ErrorMessage);
