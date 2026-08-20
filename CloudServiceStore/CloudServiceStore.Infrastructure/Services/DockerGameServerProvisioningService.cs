using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Infrastructure.Helpers;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

/// <summary>
/// Real Docker-based game server provisioning.
/// Spins up community game server images (Minecraft, Valheim, etc.) with persistent volumes.
/// </summary>
public class DockerGameServerProvisioningService : IGameServerProvisioningService
{
    private readonly DockerClientFactory _dockerFactory;
    private readonly DockerPortAllocator _portAllocator;
    private readonly DockerResourceChecker _resourceChecker;
    private readonly ILogger<DockerGameServerProvisioningService> _logger;
    private readonly int _timeoutSeconds;

    public DockerGameServerProvisioningService(
        DockerClientFactory dockerFactory,
        DockerPortAllocator portAllocator,
        DockerResourceChecker resourceChecker,
        IConfiguration configuration,
        ILogger<DockerGameServerProvisioningService> logger)
    {
        _dockerFactory = dockerFactory;
        _portAllocator = portAllocator;
        _resourceChecker = resourceChecker;
        _logger = logger;
        _timeoutSeconds = configuration.GetValue("Provisioning:TimeoutSeconds", 120); // Game servers need more time
    }

    public async Task<int> ProvisionGameServerAsync(GameServerInstance instance, CancellationToken cancellationToken = default)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_timeoutSeconds));
        var ct = cts.Token;

        var client = _dockerFactory.GetRequiredClient();
        var containerName = $"gs-{instance.Id:N}";
        string? containerId = null;

        try
        {
            _logger.LogInformation(
                "Provisioning {GameType} server '{ServerName}' (Container: {ContainerName})",
                instance.GameType, instance.ServerName, containerName);

            // 1. Pre-flight checks
            var (imageName, envVars, internalPort, memoryLimit, readyLogMarker) = GetGameConfig(instance);
            await _resourceChecker.EnsureContainerNameAvailableAsync(containerName, ct);
            await _resourceChecker.EnsureSufficientResourcesAsync(memoryLimit, ct);

            // 2. Allocate port
            int assignedPort = await _portAllocator.AllocatePortAsync(ct);

            // 3. Ensure image exists (may take a while for large game images)
            _logger.LogInformation("Ensuring image {Image} exists (may need to pull)...", imageName);
            await EnsureImageAsync(client, imageName, ct);

            // 4. Create container
            var createResponse = await client.Containers.CreateContainerAsync(new CreateContainerParameters
            {
                Image = imageName,
                Name = containerName,
                Env = envVars,
                HostConfig = new HostConfig
                {
                    Memory = memoryLimit,
                    NanoCPUs = 1_000_000_000L, // 1 CPU for game servers
                    PortBindings = new Dictionary<string, IList<PortBinding>>
                    {
                        [$"{internalPort}/tcp"] = new List<PortBinding>
                        {
                            new() { HostPort = assignedPort.ToString() }
                        },
                        [$"{internalPort}/udp"] = new List<PortBinding>
                        {
                            new() { HostPort = assignedPort.ToString() }
                        }
                    },
                    Binds = new List<string>
                    {
                        $"gs-{instance.Id:N}:/data"
                    },
                    RestartPolicy = new RestartPolicy { Name = RestartPolicyKind.UnlessStopped }
                },
                ExposedPorts = new Dictionary<string, EmptyStruct>
                {
                    [$"{internalPort}/tcp"] = default,
                    [$"{internalPort}/udp"] = default
                }
            }, ct);

            containerId = createResponse.ID;
            _logger.LogInformation("Game server container {ContainerId} created, starting...", containerId);

            // 5. Start container
            var started = await client.Containers.StartContainerAsync(containerId, new ContainerStartParameters(), ct);
            if (!started)
            {
                throw new InvalidOperationException($"Failed to start game server container {containerId}");
            }

            // 6. Healthcheck — parse logs for "server started" marker
            _logger.LogInformation("Waiting for {GameType} server to become ready (marker: '{Marker}')...",
                instance.GameType, readyLogMarker);
            bool isReady = await WaitForLogMarkerAsync(client, containerId, readyLogMarker, ct);

            if (!isReady)
            {
                _logger.LogWarning(
                    "Game server '{ServerName}' didn't report ready within timeout. " +
                    "It may still be starting (some servers take >2min). Marking as running anyway.",
                    instance.ServerName);
            }

            _logger.LogInformation(
                "Game server '{ServerName}' ({GameType}) provisioned on port {Port} (Container: {ContainerId})",
                instance.ServerName, instance.GameType, assignedPort, containerId);

            return assignedPort;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Game server provisioning cancelled for '{ServerName}'", instance.ServerName);
            await CleanupContainerAsync(client, containerId, containerName);
            return -1;
        }
        catch (OperationCanceledException)
        {
            _logger.LogError("Game server provisioning timed out after {Timeout}s for '{ServerName}'",
                _timeoutSeconds, instance.ServerName);
            await CleanupContainerAsync(client, containerId, containerName);
            return -1;
        }
        catch (Exception ex) when (ex is not Application.Exceptions.BadRequestException
                                    && ex is not Application.Exceptions.ConflictException)
        {
            _logger.LogError(ex, "Failed to provision game server '{ServerName}' ({GameType})",
                instance.ServerName, instance.GameType);
            await CleanupContainerAsync(client, containerId, containerName);
            return -1;
        }
    }

    private static (string Image, List<string> Env, int Port, long Memory, string ReadyMarker) GetGameConfig(
        GameServerInstance instance)
    {
        return instance.GameType switch
        {
            GameType.Minecraft => (
                "itzg/minecraft-server:latest",
                new List<string>
                {
                    "EULA=TRUE",
                    "TYPE=VANILLA",
                    $"SERVER_NAME={instance.ServerName}",
                    "MEMORY=512M",
                    "MAX_PLAYERS=20"
                },
                25565,
                768 * 1024 * 1024L, // 768MB
                "Done"
            ),

            GameType.CS2 => (
                "cm2network/cs2:latest",
                new List<string>
                {
                    $"SERVER_NAME={instance.ServerName}",
                    "SRCDS_TOKEN=",
                    "CS2_SERVERNAME=CloudCS2"
                },
                27015,
                1024 * 1024 * 1024L, // 1GB
                "Server is ready"
            ),

            GameType.Rust => (
                "didstopia/rust-server:latest",
                new List<string>
                {
                    $"RUST_SERVER_NAME={instance.ServerName}",
                    "RUST_SERVER_WORLDSIZE=3000"
                },
                28015,
                1024 * 1024 * 1024L, // 1GB
                "Server startup complete"
            ),

            _ => (
                "alpine:latest",
                new List<string>
                {
                    $"SERVER_NAME={instance.ServerName}"
                },
                8080,
                128 * 1024 * 1024L, // 128MB
                "ready"
            )
        };
    }

    private async Task<bool> WaitForLogMarkerAsync(
        IDockerClient client, string containerId, string marker, CancellationToken ct)
    {
        const int maxWaitSeconds = 90;
        var deadline = DateTime.UtcNow.AddSeconds(maxWaitSeconds);

        while (DateTime.UtcNow < deadline && !ct.IsCancellationRequested)
        {
            try
            {
                var logStream = await client.Containers.GetContainerLogsAsync(containerId,
                    false,
                    new ContainerLogsParameters { ShowStdout = true, ShowStderr = true, Tail = "50" },
                    ct);

                using (logStream)
                {
                    using var stdout = new MemoryStream();
                    using var stderr = new MemoryStream();
                    await logStream.CopyOutputToAsync(null, stdout, stderr, ct);

                    var logs = System.Text.Encoding.UTF8.GetString(stdout.ToArray());

                    if (logs.Contains(marker, StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogInformation("Game server ready marker '{Marker}' found in logs", marker);
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug("Error reading game server logs: {Error}", ex.Message);
            }

            await Task.Delay(3000, ct);
        }

        return false;
    }

    private async Task EnsureImageAsync(IDockerClient client, string imageName, CancellationToken ct)
    {
        var images = await client.Images.ListImagesAsync(new ImagesListParameters
        {
            Filters = new Dictionary<string, IDictionary<string, bool>>
            {
                ["reference"] = new Dictionary<string, bool> { [imageName] = true }
            }
        }, ct);

        if (images.Count > 0) return;

        _logger.LogInformation("Pulling Docker image {ImageName} (this may take a while for game servers)...", imageName);
        await client.Images.CreateImageAsync(
            new ImagesCreateParameters { FromImage = imageName },
            null,
            new Progress<JSONMessage>(m =>
            {
                if (!string.IsNullOrWhiteSpace(m.Status))
                    _logger.LogDebug("Docker pull: {Status}", m.Status);
            }),
            ct);
    }

    private async Task CleanupContainerAsync(IDockerClient? client, string? containerId, string containerName)
    {
        if (client == null || string.IsNullOrEmpty(containerId)) return;

        try
        {
            _logger.LogWarning("Rolling back: removing game server container {ContainerName}", containerName);
            try { await client.Containers.StopContainerAsync(containerId, new ContainerStopParameters { WaitBeforeKillSeconds = 2 }); }
            catch { /* container may not be running */ }
            await client.Containers.RemoveContainerAsync(containerId,
                new ContainerRemoveParameters { Force = true, RemoveVolumes = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup game server container during rollback");
        }
    }
}
