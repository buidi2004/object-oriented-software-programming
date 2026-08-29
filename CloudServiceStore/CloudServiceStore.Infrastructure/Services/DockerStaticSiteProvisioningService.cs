using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
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
/// Real Docker-based static site provisioning using Nginx Alpine containers.
/// Each static site gets its own lightweight Nginx container serving files from a mounted volume.
/// </summary>
public class DockerStaticSiteProvisioningService : IStaticSiteProvisioningService
{
    private readonly DockerClientFactory _dockerFactory;
    private readonly DockerPortAllocator _portAllocator;
    private readonly DockerResourceChecker _resourceChecker;
    private readonly ILogger<DockerStaticSiteProvisioningService> _logger;
    private readonly int _timeoutSeconds;
    private readonly string _dataPath;

    public DockerStaticSiteProvisioningService(
        DockerClientFactory dockerFactory,
        DockerPortAllocator portAllocator,
        DockerResourceChecker resourceChecker,
        IConfiguration configuration,
        ILogger<DockerStaticSiteProvisioningService> logger)
    {
        _dockerFactory = dockerFactory;
        _portAllocator = portAllocator;
        _resourceChecker = resourceChecker;
        _logger = logger;
        _timeoutSeconds = configuration.GetValue("Provisioning:TimeoutSeconds", 60);
        _dataPath = configuration.GetValue("Provisioning:DataPath", "/app/provisioning-data")!;
    }

    public async Task<bool> ProvisionProjectAsync(StaticSite staticSite, CancellationToken cancellationToken = default)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_timeoutSeconds));
        var ct = cts.Token;

        var client = _dockerFactory.GetRequiredClient();
        var containerName = $"site-{staticSite.Id:N}";
        string? containerId = null;

        try
        {
            _logger.LogInformation("Provisioning static site '{Name}' (Container: {ContainerName})",
                staticSite.Name, containerName);

            // 1. Pre-flight checks
            await _resourceChecker.EnsureContainerNameAvailableAsync(containerName, ct);
            long requiredMemory = 32 * 1024 * 1024L; // 32MB — Nginx is very lightweight
            await _resourceChecker.EnsureSufficientResourcesAsync(requiredMemory, ct);

            // 2. Allocate port
            int assignedPort = await _portAllocator.AllocatePortAsync(ct);

            // 3. Prepare site directory with default index.html
            var siteDir = Path.Combine(_dataPath, "static-sites", staticSite.Id.ToString("N"));
            Directory.CreateDirectory(siteDir);

            // Create a default landing page if site directory is empty
            var indexPath = Path.Combine(siteDir, "index.html");
            if (!File.Exists(indexPath))
            {
                var defaultHtml = $@"<!DOCTYPE html>
<html lang=""vi"">
<head><meta charset=""UTF-8""><title>{staticSite.Name}</title>
<style>body{{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;color:#eee}}
.card{{text-align:center;padding:2rem;border-radius:12px;background:#16213e;box-shadow:0 4px 20px rgba(0,0,0,.3)}}
h1{{color:#e94560}}</style></head>
<body><div class=""card""><h1>🚀 {staticSite.Name}</h1><p>Static site đã sẵn sàng! Upload file của bạn vào đây.</p>
<p style=""opacity:.5"">Powered by CloudServiceStore</p></div></body></html>";
                await File.WriteAllTextAsync(indexPath, defaultHtml, ct);
            }

            // 4. Ensure nginx image exists
            await EnsureImageAsync(client, "nginx:alpine", ct);

            // 5. Create container
            var createResponse = await client.Containers.CreateContainerAsync(new CreateContainerParameters
            {
                Image = "nginx:alpine",
                Name = containerName,
                HostConfig = new HostConfig
                {
                    Memory = requiredMemory,
                    NanoCPUs = 250_000_000L, // 0.25 CPU
                    PortBindings = new Dictionary<string, IList<PortBinding>>
                    {
                        ["80/tcp"] = new List<PortBinding>
                        {
                            new() { HostPort = assignedPort.ToString() }
                        }
                    },
                    Binds = new List<string>
                    {
                        $"{siteDir}:/usr/share/nginx/html:ro"
                    },
                    RestartPolicy = new RestartPolicy { Name = RestartPolicyKind.UnlessStopped }
                },
                ExposedPorts = new Dictionary<string, EmptyStruct>
                {
                    ["80/tcp"] = default
                }
            }, ct);

            containerId = createResponse.ID;

            // 6. Start container
            var started = await client.Containers.StartContainerAsync(containerId, new ContainerStartParameters(), ct);
            if (!started)
            {
                throw new InvalidOperationException($"Failed to start static site container {containerId}");
            }

            // 7. Quick healthcheck — Nginx starts almost instantly
            await Task.Delay(1000, ct); // Brief pause for Nginx startup
            bool isRunning = await IsContainerRunningAsync(client, containerId, ct);

            if (!isRunning)
            {
                throw new InvalidOperationException("Static site container exited immediately after start.");
            }

            _logger.LogInformation(
                "Static site '{Name}' provisioned on port {Port} (Container: {ContainerId})",
                staticSite.Name, assignedPort, containerId);

            return true;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Static site provisioning cancelled for '{Name}'", staticSite.Name);
            await CleanupContainerAsync(client, containerId, containerName);
            return false;
        }
        catch (OperationCanceledException)
        {
            _logger.LogError("Static site provisioning timed out for '{Name}'", staticSite.Name);
            await CleanupContainerAsync(client, containerId, containerName);
            return false;
        }
        catch (Exception ex) when (ex is not Application.Exceptions.BadRequestException
                                    && ex is not Application.Exceptions.ConflictException)
        {
            _logger.LogError(ex, "Failed to provision static site '{Name}'", staticSite.Name);
            await CleanupContainerAsync(client, containerId, containerName);
            return false;
        }
    }

    private async Task<bool> IsContainerRunningAsync(IDockerClient client, string containerId, CancellationToken ct)
    {
        try
        {
            var inspect = await client.Containers.InspectContainerAsync(containerId, ct);
            return inspect.State.Running;
        }
        catch
        {
            return false;
        }
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

        _logger.LogInformation("Pulling image {ImageName}...", imageName);
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
            _logger.LogWarning("Rolling back: removing static site container {ContainerName}", containerName);
            try { await client.Containers.StopContainerAsync(containerId, new ContainerStopParameters { WaitBeforeKillSeconds = 1 }); }
            catch { /* may not be running */ }
            await client.Containers.RemoveContainerAsync(containerId,
                new ContainerRemoveParameters { Force = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup static site container during rollback");
        }
    }
}
