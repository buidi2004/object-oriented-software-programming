using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Helpers;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

/// <summary>
/// Real Docker-based application installer service.
/// Spins up applications like WordPress, Ghost, n8n, Adminer in isolated containers with persistent volumes.
/// </summary>
public class DockerAppInstallerService : IAppInstallerService
{
    private readonly DockerClientFactory _dockerFactory;
    private readonly DockerPortAllocator _portAllocator;
    private readonly DockerResourceChecker _resourceChecker;
    private readonly IRepository<AppTemplate> _templateRepo;
    private readonly ILogger<DockerAppInstallerService> _logger;
    private readonly int _timeoutSeconds;

    public DockerAppInstallerService(
        DockerClientFactory dockerFactory,
        DockerPortAllocator portAllocator,
        DockerResourceChecker resourceChecker,
        IRepository<AppTemplate> templateRepo,
        IConfiguration configuration,
        ILogger<DockerAppInstallerService> logger)
    {
        _dockerFactory = dockerFactory;
        _portAllocator = portAllocator;
        _resourceChecker = resourceChecker;
        _templateRepo = templateRepo;
        _logger = logger;
        _timeoutSeconds = configuration.GetValue("Provisioning:TimeoutSeconds", 90);
    }

    public async Task<string> InstallAppAsync(AppInstallation installation, CancellationToken cancellationToken = default)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_timeoutSeconds));
        var ct = cts.Token;

        var client = _dockerFactory.GetRequiredClient();
        var containerName = $"app-{installation.Id:N}";
        string? containerId = null;

        try
        {
            var template = await _templateRepo.GetByIdAsync(installation.TemplateId, ct);
            var templateName = template?.Name ?? "App";
            var dockerImage = !string.IsNullOrWhiteSpace(template?.DockerImage)
                ? template.DockerImage
                : GetDefaultImageForTemplate(templateName);

            _logger.LogInformation("Installing app '{AppName}' from image '{Image}' (Container: {ContainerName})",
                templateName, dockerImage, containerName);

            // 1. Pre-flight checks
            await _resourceChecker.EnsureContainerNameAvailableAsync(containerName, ct);
            long requiredMemory = 256 * 1024 * 1024L; // 256MB
            await _resourceChecker.EnsureSufficientResourcesAsync(requiredMemory, ct);

            // 2. Allocate port
            int assignedPort = await _portAllocator.AllocatePortAsync(ct);
            int internalPort = GetInternalPortForImage(dockerImage);

            // 3. Ensure image exists
            await EnsureImageAsync(client, dockerImage, ct);

            // 4. Create container with app-specific environment
            var envVars = GetEnvVarsForApp(templateName, installation.Id.ToString("N"));

            var createResponse = await client.Containers.CreateContainerAsync(new CreateContainerParameters
            {
                Image = dockerImage,
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
                        $"app-{installation.Id:N}:/data"
                    },
                    RestartPolicy = new RestartPolicy { Name = RestartPolicyKind.UnlessStopped }
                },
                ExposedPorts = new Dictionary<string, EmptyStruct>
                {
                    [$"{internalPort}/tcp"] = default
                }
            }, ct);

            containerId = createResponse.ID;
            installation.ContainerId = containerId;

            // 5. Start container
            var started = await client.Containers.StartContainerAsync(containerId, new ContainerStartParameters(), ct);
            if (!started)
            {
                throw new InvalidOperationException($"Failed to start app container {containerId}");
            }

            // 6. Quick health check
            await Task.Delay(1000, ct);
            var isRunning = await IsContainerRunningAsync(client, containerId, ct);
            if (!isRunning)
            {
                throw new InvalidOperationException($"App container {containerName} is not running.");
            }

            var installUrl = $"http://localhost:{assignedPort}";
            _logger.LogInformation("App '{AppName}' successfully installed at {Url} (Container: {ContainerId})",
                templateName, installUrl, containerId);

            return installUrl;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("App installation cancelled for {Id}", installation.Id);
            await CleanupContainerAsync(client, containerId, containerName);
            return string.Empty;
        }
        catch (OperationCanceledException)
        {
            _logger.LogError("App installation timed out after {Timeout}s", _timeoutSeconds);
            await CleanupContainerAsync(client, containerId, containerName);
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to install app for installation {Id}", installation.Id);
            await CleanupContainerAsync(client, containerId, containerName);
            return string.Empty;
        }
    }

    private async Task<bool> IsContainerRunningAsync(IDockerClient client, string containerId, CancellationToken ct)
    {
        try
        {
            var inspect = await client.Containers.InspectContainerAsync(containerId, ct);
            var stateProp = inspect.GetType().GetProperty("State");
            var stateObj = stateProp?.GetValue(inspect);
            var runningProp = stateObj?.GetType().GetProperty("Running");
            return (bool?)runningProp?.GetValue(stateObj) ?? true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not inspect app container {ContainerId}", containerId);
            return true;
        }
    }

    private static string GetDefaultImageForTemplate(string templateName)
    {
        var lower = templateName.ToLowerInvariant();
        if (lower.Contains("wordpress")) return "wordpress:php8.2-apache";
        if (lower.Contains("ghost")) return "ghost:5-alpine";
        if (lower.Contains("n8n")) return "n8nio/n8n:latest";
        if (lower.Contains("adminer") || lower.Contains("database")) return "adminer:latest";
        if (lower.Contains("nextcloud")) return "nextcloud:apache";
        return "nginx:alpine";
    }

    private static int GetInternalPortForImage(string image)
    {
        var lower = image.ToLowerInvariant();
        if (lower.Contains("ghost")) return 2368;
        if (lower.Contains("n8n")) return 5678;
        if (lower.Contains("adminer")) return 8080;
        return 80; // WordPress, Nginx, Nextcloud default HTTP port
    }

    private static List<string> GetEnvVarsForApp(string templateName, string instanceKey)
    {
        var env = new List<string>();
        var lower = templateName.ToLowerInvariant();

        if (lower.Contains("wordpress"))
        {
            env.Add("WORDPRESS_DB_HOST=sqlserver");
            env.Add($"WORDPRESS_DB_NAME=wp_{instanceKey[..8]}");
            env.Add("WORDPRESS_TABLE_PREFIX=wp_");
        }
        else if (lower.Contains("ghost"))
        {
            env.Add("NODE_ENV=production");
        }
        else if (lower.Contains("n8n"))
        {
            env.Add("N8N_BASIC_AUTH_ACTIVE=false");
        }

        return env;
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
            _logger.LogWarning("Rolling back: removing app container {ContainerName}", containerName);
            try { await client.Containers.StopContainerAsync(containerId, new ContainerStopParameters { WaitBeforeKillSeconds = 1 }); }
            catch { /* ignore */ }
            await client.Containers.RemoveContainerAsync(containerId, new ContainerRemoveParameters { Force = true, RemoveVolumes = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup app container during rollback");
        }
    }
}
