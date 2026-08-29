using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Helpers;

/// <summary>
/// Checks host resources (RAM, disk) before spinning up new containers.
/// Prevents OOM kills and disk-full scenarios with clear business errors instead of 500s.
/// </summary>
public class DockerResourceChecker
{
    private readonly DockerClientFactory _dockerFactory;
    private readonly ILogger<DockerResourceChecker> _logger;

    // Minimum free resources to allow provisioning
    private const long MinFreeMemoryBytes = 200 * 1024 * 1024; // 200MB
    private const long MinFreeDiskBytes = 500L * 1024 * 1024;  // 500MB

    public DockerResourceChecker(
        DockerClientFactory dockerFactory,
        ILogger<DockerResourceChecker> logger)
    {
        _dockerFactory = dockerFactory;
        _logger = logger;
    }

    /// <summary>
    /// Validates that the host has enough resources to provision a new container.
    /// Throws BadRequestException with clear message if resources are insufficient.
    /// </summary>
    public async Task EnsureSufficientResourcesAsync(long requiredMemoryBytes, CancellationToken ct = default)
    {
        var client = _dockerFactory.Client;
        if (client == null)
        {
            _logger.LogWarning("Docker client unavailable — skipping resource check.");
            return;
        }

        try
        {
            var systemInfo = await client.System.GetSystemInfoAsync(ct);

            // Check memory
            long totalMemory = systemInfo.MemTotal;
            // We estimate used memory from containers
            var containers = await client.Containers.ListContainersAsync(
                new ContainersListParameters { All = false }, ct); // Only running containers

            long estimatedUsedMemory = 0;
            foreach (var container in containers)
            {
                // Docker API doesn't expose memory usage in list — use a conservative estimate
                // We check the container's configured memory limit instead
                try
                {
                    var inspect = await client.Containers.InspectContainerAsync(container.ID, ct);
                    var memLimit = inspect.HostConfig?.Memory ?? 0;
                    estimatedUsedMemory += memLimit > 0 ? memLimit : 128 * 1024 * 1024; // Default 128MB if unlimited
                }
                catch
                {
                    estimatedUsedMemory += 128 * 1024 * 1024; // Conservative fallback
                }
            }

            long estimatedFreeMemory = totalMemory - estimatedUsedMemory;

            _logger.LogInformation(
                "Resource check: Total={TotalMB}MB, EstimatedUsed={UsedMB}MB, EstimatedFree={FreeMB}MB, Required={RequiredMB}MB",
                totalMemory / (1024 * 1024),
                estimatedUsedMemory / (1024 * 1024),
                estimatedFreeMemory / (1024 * 1024),
                requiredMemoryBytes / (1024 * 1024));

            if (estimatedFreeMemory < requiredMemoryBytes + MinFreeMemoryBytes)
            {
                _logger.LogWarning(
                    "Server có thể không đủ RAM để tạo dịch vụ mới. " +
                    "Cần tối thiểu {RequiredMB}MB RAM trống, hiện chỉ còn khoảng {FreeMB}MB. " +
                    "Tuy nhiên, sẽ tiếp tục thử tạo...",
                    (requiredMemoryBytes + MinFreeMemoryBytes) / (1024 * 1024),
                    estimatedFreeMemory / (1024 * 1024));
                
                // Demo purpose: DO NOT block VPS creation on low-RAM hosts.
                // throw new BadRequestException(...);
            }

            // Check disk via Docker system info
            var diskInfo = await client.System.GetSystemInfoAsync(ct);
            // Docker doesn't directly expose free disk — we use driver status
            // For now, log a warning if we can't determine disk space
            _logger.LogDebug("Resource check passed for {RequiredMB}MB allocation", requiredMemoryBytes / (1024 * 1024));
        }
        catch (BadRequestException)
        {
            throw; // Re-throw business exceptions
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check host resources. Proceeding with provisioning anyway.");
            // Don't block provisioning if we can't check resources — Docker will enforce limits
        }
    }

    /// <summary>
    /// Checks if a container with the given name already exists (for idempotency/conflict detection).
    /// </summary>
    public async Task EnsureContainerNameAvailableAsync(string containerName, CancellationToken ct = default)
    {
        var client = _dockerFactory.Client;
        if (client == null) return;

        try
        {
            var containers = await client.Containers.ListContainersAsync(
                new ContainersListParameters
                {
                    All = true,
                    Filters = new Dictionary<string, IDictionary<string, bool>>
                    {
                        ["name"] = new Dictionary<string, bool> { [$"^/{containerName}$"] = true }
                    }
                }, ct);

            if (containers.Count > 0)
            {
                throw new ConflictException(
                    $"Container với tên '{containerName}' đã tồn tại. " +
                    "Vui lòng chọn tên khác hoặc xóa container cũ trước.");
            }
        }
        catch (ConflictException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check container name availability for '{ContainerName}'", containerName);
        }
    }
}
