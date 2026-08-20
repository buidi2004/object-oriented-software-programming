using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Helpers;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

/// <summary>
/// Real Docker-based database provisioning service.
/// Creates actual PostgreSQL/MySQL/Redis containers via Docker.DotNet.
/// </summary>
public class DockerDatabaseProvisioningService : IDatabaseProvisioningService
{
    private readonly DockerClientFactory _dockerFactory;
    private readonly DockerPortAllocator _portAllocator;
    private readonly DockerResourceChecker _resourceChecker;
    private readonly ILogger<DockerDatabaseProvisioningService> _logger;
    private readonly int _timeoutSeconds;

    public DockerDatabaseProvisioningService(
        DockerClientFactory dockerFactory,
        DockerPortAllocator portAllocator,
        DockerResourceChecker resourceChecker,
        IConfiguration configuration,
        ILogger<DockerDatabaseProvisioningService> logger)
    {
        _dockerFactory = dockerFactory;
        _portAllocator = portAllocator;
        _resourceChecker = resourceChecker;
        _logger = logger;
        _timeoutSeconds = configuration.GetValue("Provisioning:TimeoutSeconds", 60);
    }

    public async Task<int> ProvisionDatabaseAsync(ManagedDatabaseInstance instance, CancellationToken cancellationToken = default)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_timeoutSeconds));
        var ct = cts.Token;

        var client = _dockerFactory.GetRequiredClient();
        var containerName = $"db-{instance.Id:N}";
        string? containerId = null;

        try
        {
            _logger.LogInformation(
                "Provisioning {Engine} database '{Name}' (Container: {ContainerName})",
                instance.Engine, instance.Name, containerName);

            // 1. Pre-flight checks
            await _resourceChecker.EnsureContainerNameAvailableAsync(containerName, ct);
            long requiredMemory = 256 * 1024 * 1024L; // 256MB default
            await _resourceChecker.EnsureSufficientResourcesAsync(requiredMemory, ct);

            // 2. Allocate port
            int assignedPort = await _portAllocator.AllocatePortAsync(ct);

            // 3. Determine image and env based on engine
            var (imageName, envVars, internalPort, healthCmd) = GetEngineConfig(instance);

            // 4. Ensure image exists
            await EnsureImageAsync(client, imageName, ct);

            // 5. Create container
            _logger.LogInformation("Creating container {ContainerName} from {Image} on port {Port}",
                containerName, imageName, assignedPort);

            var createResponse = await client.Containers.CreateContainerAsync(new CreateContainerParameters
            {
                Image = imageName,
                Name = containerName,
                Env = envVars,
                HostConfig = new HostConfig
                {
                    Memory = requiredMemory,
                    NanoCPUs = 500_000_000L, // 0.5 CPU
                    PortBindings = new Dictionary<string, IList<PortBinding>>
                    {
                        [$"{internalPort}/tcp"] = new List<PortBinding>
                        {
                            new() { HostPort = assignedPort.ToString() }
                        }
                    },
                    Binds = new List<string>
                    {
                        $"db-{instance.Id:N}:/var/lib/{GetDataDir(instance.Engine)}"
                    },
                    RestartPolicy = new RestartPolicy { Name = RestartPolicyKind.UnlessStopped }
                },
                ExposedPorts = new Dictionary<string, EmptyStruct>
                {
                    [$"{internalPort}/tcp"] = default
                }
            }, ct);

            containerId = createResponse.ID;
            _logger.LogInformation("Container {ContainerId} created, starting...", containerId);

            // 6. Start container
            var started = await client.Containers.StartContainerAsync(containerId, new ContainerStartParameters(), ct);
            if (!started)
            {
                throw new InvalidOperationException($"Failed to start container {containerId}");
            }

            // 7. Healthcheck — wait for database to be ready
            _logger.LogInformation("Waiting for {Engine} to become ready...", instance.Engine);
            bool isHealthy = await WaitForHealthyAsync(client, containerId, healthCmd, ct);

            if (!isHealthy)
            {
                throw new InvalidOperationException(
                    $"Database {instance.Engine} failed healthcheck after {_timeoutSeconds}s. Container logs may have more details.");
            }

            _logger.LogInformation(
                "Database '{Name}' ({Engine}) provisioned successfully on port {Port} (Container: {ContainerId})",
                instance.Name, instance.Engine, assignedPort, containerId);

            return assignedPort;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Database provisioning cancelled for '{Name}'", instance.Name);
            await CleanupContainerAsync(client, containerId, containerName);
            return -1;
        }
        catch (OperationCanceledException)
        {
            _logger.LogError("Database provisioning timed out after {Timeout}s for '{Name}'", _timeoutSeconds, instance.Name);
            await CleanupContainerAsync(client, containerId, containerName);
            return -1;
        }
        catch (Exception ex) when (ex is not Application.Exceptions.BadRequestException
                                    && ex is not Application.Exceptions.ConflictException)
        {
            _logger.LogError(ex, "Failed to provision database '{Name}' ({Engine})", instance.Name, instance.Engine);
            await CleanupContainerAsync(client, containerId, containerName);
            return -1;
        }
    }

    public async Task TerminateDatabaseAsync(string containerId, CancellationToken ct = default)
    {
        var client = _dockerFactory.Client;
        if (client == null) return;

        try
        {
            _logger.LogInformation("Terminating database container {ContainerId}", containerId);
            await client.Containers.StopContainerAsync(containerId,
                new ContainerStopParameters { WaitBeforeKillSeconds = 5 }, ct);
            await client.Containers.RemoveContainerAsync(containerId,
                new ContainerRemoveParameters { Force = true, RemoveVolumes = false }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error terminating database container {ContainerId}", containerId);
        }
    }

    private static (string Image, List<string> Env, int Port, string[] HealthCmd) GetEngineConfig(
        ManagedDatabaseInstance instance)
    {
        return instance.Engine switch
        {
            ManagedDatabaseEngine.PostgreSQL => (
                $"postgres:{instance.Version ?? "16"}-alpine",
                new List<string>
                {
                    $"POSTGRES_USER={instance.AdminUser}",
                    $"POSTGRES_PASSWORD={instance.AdminPassword}",
                    $"POSTGRES_DB={instance.Name}"
                },
                5432,
                new[] { "pg_isready", "-U", instance.AdminUser }
            ),

            ManagedDatabaseEngine.MySQL => (
                $"mysql:{instance.Version ?? "8.0"}",
                new List<string>
                {
                    $"MYSQL_ROOT_PASSWORD={instance.AdminPassword}",
                    $"MYSQL_DATABASE={instance.Name}",
                    $"MYSQL_USER={instance.AdminUser}",
                    $"MYSQL_PASSWORD={instance.AdminPassword}"
                },
                3306,
                new[] { "mysqladmin", "ping", "-h", "localhost", "-u", instance.AdminUser, $"-p{instance.AdminPassword}" }
            ),

            ManagedDatabaseEngine.Redis => (
                $"redis:{instance.Version ?? "7"}-alpine",
                new List<string>(), // Redis doesn't need auth env by default
                6379,
                new[] { "redis-cli", "ping" }
            ),

            _ => throw new Application.Exceptions.BadRequestException(
                $"Database engine '{instance.Engine}' không được hỗ trợ. Chọn: PostgreSQL, MySQL, hoặc Redis.")
        };
    }

    private static string GetDataDir(ManagedDatabaseEngine engine)
    {
        return engine switch
        {
            ManagedDatabaseEngine.PostgreSQL => "postgresql/data",
            ManagedDatabaseEngine.MySQL => "mysql",
            ManagedDatabaseEngine.Redis => "data",
            _ => "data"
        };
    }

    private async Task<bool> WaitForHealthyAsync(
        IDockerClient client, string containerId, string[] healthCmd, CancellationToken ct)
    {
        const int maxAttempts = 15;
        const int delayMs = 2000;

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            ct.ThrowIfCancellationRequested();

            try
            {
                var execCreate = await client.Exec.ExecCreateContainerAsync(containerId,
                    new ContainerExecCreateParameters
                    {
                        Cmd = healthCmd,
                        AttachStdout = true,
                        AttachStderr = true
                    }, ct);

                var execStart = await client.Exec.StartAndAttachContainerExecAsync(execCreate.ID, false, ct);
                execStart.Dispose();

                var execInspect = await client.Exec.InspectContainerExecAsync(execCreate.ID, ct);
                if (execInspect.ExitCode == 0)
                {
                    _logger.LogInformation("Healthcheck passed on attempt {Attempt}/{Max}", attempt, maxAttempts);
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug("Healthcheck attempt {Attempt}/{Max} failed: {Error}", attempt, maxAttempts, ex.Message);
            }

            await Task.Delay(delayMs, ct);
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

        _logger.LogInformation("Pulling Docker image {ImageName}...", imageName);
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
            _logger.LogWarning("Rolling back: removing container {ContainerName} ({ContainerId})", containerName, containerId);
            await client.Containers.StopContainerAsync(containerId,
                new ContainerStopParameters { WaitBeforeKillSeconds = 2 });
            await client.Containers.RemoveContainerAsync(containerId,
                new ContainerRemoveParameters { Force = true, RemoveVolumes = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup container {ContainerName} during rollback", containerName);
        }
    }
}
