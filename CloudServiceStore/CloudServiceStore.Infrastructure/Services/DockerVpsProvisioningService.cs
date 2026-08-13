using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

public class DockerVpsProvisioningService : IVpsProvisioningService
{
    private readonly IDockerClient _dockerClient;
    private readonly ILogger<DockerVpsProvisioningService> _logger;

    public DockerVpsProvisioningService(ILogger<DockerVpsProvisioningService> logger)
    {
        _logger = logger;
        // In local/Unix environments, /var/run/docker.sock is the default
        // In Windows it would be npipe://./pipe/docker_engine
        var dockerUri = Environment.OSVersion.Platform == PlatformID.Win32NT 
            ? "npipe://./pipe/docker_engine" 
            : "unix:///var/run/docker.sock";
            
        _dockerClient = new DockerClientConfiguration(new Uri(dockerUri)).CreateClient();
    }

    public async Task<string> ProvisionAsync(Guid orderId, Guid userId, CancellationToken ct)
    {
        var containerName = $"vps-demo-{userId}-{Guid.NewGuid().ToString().Substring(0, 8)}";
        _logger.LogInformation("Provisioning VPS {ContainerName} for User {UserId}", containerName, userId);

        try
        {
            var response = await _dockerClient.Containers.CreateContainerAsync(new CreateContainerParameters
            {
                Image = "vps-demo-image",
                Name = containerName,
                HostConfig = new HostConfig
                {
                    Memory = 512 * 1024 * 1024, // 512MB
                    NanoCPUs = 1_000_000_000, // 1 CPU Core
                    PidsLimit = 100,
                    NetworkMode = "bridge"
                },
                Tty = true,
                AttachStdin = true,
                AttachStdout = true,
                AttachStderr = true,
                OpenStdin = true
            }, ct);

            if (response != null && !string.IsNullOrEmpty(response.ID))
            {
                await _dockerClient.Containers.StartContainerAsync(response.ID, new ContainerStartParameters(), ct);
                _logger.LogInformation("Started container {ContainerId}", response.ID);
                return response.ID;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error provisioning container for {ContainerName}", containerName);
        }

        return string.Empty;
    }

    public async Task<string> ExecCommandAsync(string containerId, string command, CancellationToken ct)
    {
        try
        {
            var execResponse = await _dockerClient.Exec.ExecCreateContainerAsync(containerId, new ContainerExecCreateParameters
            {
                AttachStderr = true,
                AttachStdout = true,
                Cmd = new List<string> { "bash", "-c", command },
                Tty = false
            }, ct);

            using var stream = await _dockerClient.Exec.StartAndAttachContainerExecAsync(execResponse.ID, false, ct);
            var (stdout, stderr) = await stream.ReadOutputToEndAsync(ct);

            return string.IsNullOrEmpty(stderr) ? stdout : $"{stdout}\n{stderr}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing command in container {ContainerId}", containerId);
            return $"Error: {ex.Message}";
        }
    }

    public async Task TerminateAsync(string containerId, CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("Terminating container {ContainerId}", containerId);
            await _dockerClient.Containers.StopContainerAsync(containerId, new ContainerStopParameters { WaitBeforeKillSeconds = 2 }, ct);
            await _dockerClient.Containers.RemoveContainerAsync(containerId, new ContainerRemoveParameters { Force = true }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error terminating container {ContainerId}", containerId);
        }
    }

    public async Task<bool> IsRunningAsync(string containerId, CancellationToken ct)
    {
        try
        {
            var inspect = await _dockerClient.Containers.InspectContainerAsync(containerId, ct);
            return inspect.State.Running;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not inspect container {ContainerId}", containerId);
            return false;
        }
    }
}
