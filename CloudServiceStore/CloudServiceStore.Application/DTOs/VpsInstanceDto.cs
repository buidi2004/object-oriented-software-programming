using System;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.DTOs;

public record VpsInstanceDto(
    Guid Id,
    Guid OrderId,
    Guid UserId,
    string ContainerName,
    string ContainerId,
    string Status,
    int CpuCores,
    int RamMb,
    int? DiskGb,
    string PlanName,
    string? CustomerEmail,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    DateTime LastActiveAt);

public static class VpsInstanceMapper
{
    public static VpsInstanceDto ToDto(VpsInstance instance, string? customerEmail = null) =>
        new(
            instance.Id,
            instance.OrderId,
            instance.UserId,
            instance.ContainerName,
            instance.ContainerId,
            StatusToString(instance.Status),
            instance.CpuCores,
            instance.RamMb,
            instance.DiskGb,
            instance.PlanName,
            customerEmail ?? instance.User?.Email,
            instance.CreatedAt,
            instance.ExpiresAt,
            instance.LastActiveAt);

    public static string StatusToString(VpsInstanceStatus status) => status switch
    {
        VpsInstanceStatus.Provisioning => "Provisioning",
        VpsInstanceStatus.Running => "Running",
        VpsInstanceStatus.Terminated => "Terminated",
        VpsInstanceStatus.Failed => "Failed",
        _ => status.ToString()
    };
}
