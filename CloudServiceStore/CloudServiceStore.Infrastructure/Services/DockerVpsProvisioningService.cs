using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Models;
using CloudServiceStore.Infrastructure.Helpers;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Services;

public class DockerVpsProvisioningService : IVpsProvisioningService
{
    // BUG #1 FIX: Use shared DockerClientFactory singleton instead of creating a new client per instance
    private readonly DockerClientFactory _dockerFactory;
    private readonly DockerPortAllocator _portAllocator;
    private readonly DockerResourceChecker _resourceChecker;
    private readonly ILogger<DockerVpsProvisioningService> _logger;

    public DockerVpsProvisioningService(
        DockerClientFactory dockerFactory,
        DockerPortAllocator portAllocator,
        DockerResourceChecker resourceChecker,
        ILogger<DockerVpsProvisioningService> logger)
    {
        _dockerFactory = dockerFactory;
        _portAllocator = portAllocator;
        _resourceChecker = resourceChecker;
        _logger = logger;
    }

    public async Task<bool> IsAvailableAsync(CancellationToken ct)
    {
        var client = _dockerFactory.Client;
        if (client == null) return false;
        try
        {
            await client.System.PingAsync(ct);
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
        var client = _dockerFactory.Client;
        if (client == null)
        {
            return new ProvisionResult(false, string.Empty, string.Empty, "Docker client is not available");
        }

        _logger.LogInformation(
            "Provisioning VPS {ContainerName} with {CpuCores} cores and {MemoryBytes} bytes RAM",
            spec.ContainerName,
            spec.CpuCores,
            spec.MemoryBytes);

        try
        {
            // BUG #3 FIX: Check host RAM availability before provisioning
            long requiredMemory = Math.Min(spec.MemoryBytes, 200 * 1024 * 1024L);
            await _resourceChecker.EnsureContainerNameAvailableAsync(spec.ContainerName, ct);
            await _resourceChecker.EnsureSufficientResourcesAsync(requiredMemory, ct);

            // BUG #2 FIX: Allocate SSH port and bind it to the container
            int sshPort = await _portAllocator.AllocatePortAsync(ct);

            await EnsureImageExistsAsync(client, spec.ImageName, ct);

            var response = await client.Containers.CreateContainerAsync(new CreateContainerParameters
            {
                Image = spec.ImageName,
                Name = spec.ContainerName,
                Env = new List<string>
                {
                    "USER_NAME=root",
                    "USER_PASSWORD=root",
                    "PASSWORD_ACCESS=true",
                    "PUID=1000",
                    "PGID=1000"
                },
                HostConfig = new HostConfig
                {
                    Memory = requiredMemory,
                    NanoCPUs = Math.Min((long)spec.CpuCores, Environment.ProcessorCount) * 1_000_000_000L,
                    PidsLimit = Math.Max(100, spec.CpuCores * 100),
                    NetworkMode = "bridge",
                    // BUG #2 FIX: Bind SSH port so the user can actually connect to their VPS
                    PortBindings = new Dictionary<string, IList<PortBinding>>
                    {
                        ["2222/tcp"] = new List<PortBinding>
                        {
                            new() { HostPort = sshPort.ToString() }
                        }
                    },
                    RestartPolicy = new RestartPolicy { Name = RestartPolicyKind.UnlessStopped }
                },
                ExposedPorts = new Dictionary<string, EmptyStruct>
                {
                    ["2222/tcp"] = default
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

            var started = await client.Containers.StartContainerAsync(
                response.ID,
                new ContainerStartParameters(),
                ct);

            if (!started)
            {
                return new ProvisionResult(false, response.ID, spec.ContainerName, "Failed to start container.");
            }

            _logger.LogInformation("Started VPS container {ContainerId} with SSH on port {SshPort}", response.ID, sshPort);
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
        var client = _dockerFactory.Client;
        if (client == null) return "Docker client is not available.";
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
            var execResponse = await ((Task<ContainerExecCreateResponse>)(object)client.Exec.ExecCreateContainerAsync(
                containerId, createParams, ct));

            var multiplexed = await ((Task<MultiplexedStream>)(object)client.Exec.StartAndAttachContainerExecAsync(
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
        var client = _dockerFactory.Client;
        if (client == null) return;
        try
        {
            _logger.LogInformation("Terminating container {ContainerId}", containerId);
            await client.Containers.StopContainerAsync(
                containerId,
                new ContainerStopParameters { WaitBeforeKillSeconds = 2 },
                ct);
            await client.Containers.RemoveContainerAsync(
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
        var client = _dockerFactory.Client;
        if (client == null) return false;
        try
        {
            var inspect = await client.Containers.InspectContainerAsync(containerId, ct);
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
        var client = _dockerFactory.Client ?? throw new InvalidOperationException("Docker client is not available.");
        try
        {
            await client.Containers.StartContainerAsync(containerId, new ContainerStartParameters(), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error starting container {ContainerId}", containerId);
            throw; // Re-throw so caller can trigger re-provision fallback
        }
    }

    public async Task StopAsync(string containerId, CancellationToken ct)
    {
        var client = _dockerFactory.Client ?? throw new InvalidOperationException("Docker client is not available.");
        try
        {
            await client.Containers.StopContainerAsync(containerId, new ContainerStopParameters { WaitBeforeKillSeconds = 1 }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error stopping container {ContainerId}", containerId);
            throw; // Re-throw so caller can handle appropriately
        }
    }

    public async Task RestartAsync(string containerId, CancellationToken ct)
    {
        var client = _dockerFactory.Client ?? throw new InvalidOperationException("Docker client is not available.");
        try
        {
            await client.Containers.RestartContainerAsync(containerId, new ContainerRestartParameters { WaitBeforeKillSeconds = 1 }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error restarting container {ContainerId}", containerId);
            throw; // Re-throw so caller can trigger re-provision fallback
        }
    }

    private static async Task EnsureImageExistsAsync(IDockerClient client, string imageName, CancellationToken ct)
    {
        var images = await client.Images.ListImagesAsync(new ImagesListParameters
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

        await client.Images.CreateImageAsync(
            new ImagesCreateParameters { FromImage = imageName },
            null,
            new Progress<JSONMessage>(message =>
            {
                // Progress logging handled by caller if needed
            }),
            ct);
    }
}
