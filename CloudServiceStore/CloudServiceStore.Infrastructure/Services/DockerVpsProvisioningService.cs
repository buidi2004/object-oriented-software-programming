using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Models;
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
        var dockerUri = Environment.OSVersion.Platform == PlatformID.Win32NT
            ? "npipe://./pipe/docker_engine"
            : "unix:///var/run/docker.sock";

        _dockerClient = new DockerClientConfiguration(new Uri(dockerUri)).CreateClient();
    }

    public async Task<bool> IsAvailableAsync(CancellationToken ct)
    {
        try
        {
            await _dockerClient.System.PingAsync(ct);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Docker daemon is not available");
            return false;
        }
    }

    public async Task<ProvisionResult> ProvisionAsync(VpsProvisionSpec spec, CancellationToken ct)
    {
        _logger.LogInformation(
            "Provisioning VPS {ContainerName} with {CpuCores} cores and {MemoryBytes} bytes RAM",
            spec.ContainerName,
            spec.CpuCores,
            spec.MemoryBytes);

        try
        {
            await EnsureImageExistsAsync(spec.ImageName, ct);

            var response = await _dockerClient.Containers.CreateContainerAsync(new CreateContainerParameters
            {
                Image = spec.ImageName,
                Name = spec.ContainerName,
                HostConfig = new HostConfig
                {
                    Memory = Math.Min(spec.MemoryBytes, 200 * 1024 * 1024L), // Capped at 200MB for demo
                    NanoCPUs = spec.CpuCores * 1_000_000_000L,
                    PidsLimit = Math.Max(100, spec.CpuCores * 100),
                    NetworkMode = "bridge"
                },
                Tty = true,
                AttachStdin = true,
                AttachStdout = true,
                AttachStderr = true,
                OpenStdin = true
            }, ct);

            if (response == null || string.IsNullOrEmpty(response.ID))
            {
                return new ProvisionResult(false, string.Empty, spec.ContainerName, "Docker did not return a container ID.");
            }

            var started = await _dockerClient.Containers.StartContainerAsync(
                response.ID,
                new ContainerStartParameters(),
                ct);

            if (!started)
            {
                return new ProvisionResult(false, response.ID, spec.ContainerName, "Failed to start container.");
            }

            _logger.LogInformation("Started container {ContainerId}", response.ID);
            return new ProvisionResult(true, response.ID, spec.ContainerName, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error provisioning container {ContainerName}", spec.ContainerName);
            return new ProvisionResult(false, string.Empty, spec.ContainerName, ex.Message);
        }
    }

    public async Task<string> ExecCommandAsync(string containerId, string command, CancellationToken ct)
    {
        try
        {
            var createParams = new ContainerExecCreateParameters
            {
                AttachStderr = true,
                AttachStdout = true,
                Cmd = new List<string> { "bash", "-c", command },
                Tty = false,
                User = "root"
            };

            // Docker.DotNet 3.125.x interface omits generic return types; cast to implementation types.
            var execResponse = await ((Task<ContainerExecCreateResponse>)(object)_dockerClient.Exec.ExecCreateContainerAsync(
                containerId, createParams, ct));

            var multiplexed = await ((Task<MultiplexedStream>)(object)_dockerClient.Exec.StartAndAttachContainerExecAsync(
                execResponse.ID, false, ct));

            using (multiplexed)
            {
                using var stdout = new MemoryStream();
                using var stderr = new MemoryStream();
                await multiplexed.CopyOutputToAsync(null, stdout, stderr, ct);

                var stdoutText = System.Text.Encoding.UTF8.GetString(stdout.ToArray());
                var stderrText = System.Text.Encoding.UTF8.GetString(stderr.ToArray());
                return string.IsNullOrEmpty(stderrText) ? stdoutText : $"{stdoutText}\n{stderrText}";
            }
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
            await _dockerClient.Containers.StopContainerAsync(
                containerId,
                new ContainerStopParameters { WaitBeforeKillSeconds = 2 },
                ct);
            await _dockerClient.Containers.RemoveContainerAsync(
                containerId,
                new ContainerRemoveParameters { Force = true },
                ct);
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

    public async Task StartAsync(string containerId, CancellationToken ct)
    {
        try
        {
            await _dockerClient.Containers.StartContainerAsync(containerId, new ContainerStartParameters(), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error starting container {ContainerId}", containerId);
        }
    }

    public async Task StopAsync(string containerId, CancellationToken ct)
    {
        try
        {
            await _dockerClient.Containers.StopContainerAsync(containerId, new ContainerStopParameters { WaitBeforeKillSeconds = 5 }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error stopping container {ContainerId}", containerId);
        }
    }

    public async Task RestartAsync(string containerId, CancellationToken ct)
    {
        try
        {
            await _dockerClient.Containers.RestartContainerAsync(containerId, new ContainerRestartParameters { WaitBeforeKillSeconds = 5 }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error restarting container {ContainerId}", containerId);
        }
    }

    private async Task EnsureImageExistsAsync(string imageName, CancellationToken ct)
    {
        var images = await _dockerClient.Images.ListImagesAsync(new ImagesListParameters
        {
            Filters = new Dictionary<string, IDictionary<string, bool>>
            {
                ["reference"] = new Dictionary<string, bool> { [imageName] = true }
            }
        }, ct);

        if (images.Count > 0)
        {
            return;
        }

        if (!imageName.Contains('/') && !imageName.Contains(':'))
        {
            throw new InvalidOperationException(
                $"Docker image '{imageName}' not found locally. Build it with: docker build -t {imageName} ./docker/vps-demo-image");
        }

        _logger.LogInformation("Pulling Docker image {ImageName}", imageName);
        await _dockerClient.Images.CreateImageAsync(
            new ImagesCreateParameters { FromImage = imageName },
            null,
            new Progress<JSONMessage>(message =>
            {
                if (!string.IsNullOrWhiteSpace(message.Status))
                {
                    _logger.LogDebug("Docker pull: {Status}", message.Status);
                }
            }),
            ct);
    }
}
