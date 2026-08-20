using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Helpers;

/// <summary>
/// Allocates free ports from a configurable range for Docker containers.
/// Checks both Docker API and OS-level socket binding to avoid conflicts.
/// </summary>
public class DockerPortAllocator
{
    private readonly DockerClientFactory _dockerFactory;
    private readonly ILogger<DockerPortAllocator> _logger;
    private readonly int _portRangeStart;
    private readonly int _portRangeEnd;
    private static readonly SemaphoreSlim _lock = new(1, 1);

    public DockerPortAllocator(
        DockerClientFactory dockerFactory,
        IConfiguration configuration,
        ILogger<DockerPortAllocator> logger)
    {
        _dockerFactory = dockerFactory;
        _logger = logger;
        _portRangeStart = configuration.GetValue("Provisioning:PortRangeStart", 30000);
        _portRangeEnd = configuration.GetValue("Provisioning:PortRangeEnd", 40000);
    }

    /// <summary>
    /// Allocates a free port from the configured range.
    /// Thread-safe via semaphore to prevent race conditions between concurrent provisioning requests.
    /// </summary>
    public async Task<int> AllocatePortAsync(CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            var usedPorts = await GetUsedPortsAsync(ct);

            for (int port = _portRangeStart; port <= _portRangeEnd; port++)
            {
                if (usedPorts.Contains(port))
                    continue;

                if (IsPortAvailableOnHost(port))
                {
                    _logger.LogInformation("Allocated port {Port} for new container", port);
                    return port;
                }
            }

            throw new BadRequestException(
                $"Không còn port trống trong range {_portRangeStart}-{_portRangeEnd}. " +
                "Vui lòng liên hệ admin để mở rộng range hoặc xóa bớt dịch vụ không dùng.");
        }
        finally
        {
            _lock.Release();
        }
    }

    /// <summary>
    /// Gets all ports currently used by Docker containers on the host.
    /// </summary>
    private async Task<HashSet<int>> GetUsedPortsAsync(CancellationToken ct)
    {
        var usedPorts = new HashSet<int>();

        var client = _dockerFactory.Client;
        if (client == null) return usedPorts;

        try
        {
            var containers = await client.Containers.ListContainersAsync(
                new ContainersListParameters { All = true }, ct);

            foreach (var container in containers)
            {
                if (container.Ports == null) continue;
                foreach (var port in container.Ports)
                {
                    if (port.PublicPort > 0)
                        usedPorts.Add((int)port.PublicPort);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to list Docker containers for port check. Falling back to OS-only check.");
        }

        return usedPorts;
    }

    /// <summary>
    /// Checks if a port is available on the host OS level (not just Docker).
    /// </summary>
    private static bool IsPortAvailableOnHost(int port)
    {
        try
        {
            using var listener = new TcpListener(IPAddress.Loopback, port);
            listener.Start();
            listener.Stop();
            return true;
        }
        catch (SocketException)
        {
            return false;
        }
    }
}
