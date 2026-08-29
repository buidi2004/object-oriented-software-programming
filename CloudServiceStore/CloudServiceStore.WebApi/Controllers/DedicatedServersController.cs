using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Helpers;
using Docker.DotNet;
using Docker.DotNet.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/dedicated-servers")]
[Authorize]
public class DedicatedServersController : ControllerBase
{
    private readonly IRepository<DedicatedServer> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly DockerClientFactory _dockerFactory;
    private readonly ILogger<DedicatedServersController> _logger;

    public DedicatedServersController(
        IRepository<DedicatedServer> repo,
        IUnitOfWork uow,
        ICurrentUserService currentUser,
        DockerClientFactory dockerFactory,
        ILogger<DedicatedServersController> logger)
    {
        _repo = repo;
        _uow = uow;
        _currentUser = currentUser;
        _dockerFactory = dockerFactory;
        _logger = logger;
    }

    private string GetContainerName(Guid id) => $"ds-{id:N}";

    private async Task EnsureContainerRunningAsync(Guid id, CancellationToken ct)
    {
        var client = _dockerFactory.Client;
        if (client == null) return;

        var containerName = GetContainerName(id);
        try
        {
            var containers = await client.Containers.ListContainersAsync(new ContainersListParameters
            {
                All = true,
                Filters = new Dictionary<string, IDictionary<string, bool>>
                {
                    ["name"] = new Dictionary<string, bool> { [containerName] = true }
                }
            }, ct);

            if (containers.Count == 0)
            {
                // Ensure alpine image exists (check local cache first to avoid slow network pull)
                var localImages = await client.Images.ListImagesAsync(new ImagesListParameters
                {
                    Filters = new Dictionary<string, IDictionary<string, bool>>
                    {
                        ["reference"] = new Dictionary<string, bool> { ["alpine:latest"] = true, ["alpine"] = true }
                    }
                }, ct);

                if (localImages.Count == 0)
                {
                    try
                    {
                        await client.Images.CreateImageAsync(
                            new ImagesCreateParameters { FromImage = "alpine", Tag = "latest" },
                            null,
                            new Progress<JSONMessage>(),
                            ct);
                    }
                    catch { }
                }

                var createResp = await client.Containers.CreateContainerAsync(new CreateContainerParameters
                {
                    Image = "alpine:latest",
                    Name = containerName,
                    Cmd = new List<string>
                    {
                        "sh", "-c",
                        "echo '[IPMI]: Bare-metal server initialized' && " +
                        "echo '[BIOS]: Dell PowerEdge Lifecycle Controller Ready' && " +
                        "echo '[OS]: Ubuntu 24.04 LTS (Bare Metal Emulation Engine)' && tail -f /dev/null"
                    },
                    HostConfig = new HostConfig
                    {
                        Memory = 128 * 1024 * 1024L, // 128MB lightweight limit
                        NanoCPUs = 2_000_000_000L, // 2 vCPU
                        RestartPolicy = new RestartPolicy { Name = RestartPolicyKind.UnlessStopped }
                    }
                }, ct);

                await client.Containers.StartContainerAsync(createResp.ID, new ContainerStartParameters(), ct);
            }
            else
            {
                var existing = containers[0];
                if (existing.State != "running")
                {
                    await client.Containers.StartContainerAsync(existing.ID, new ContainerStartParameters(), ct);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed ensuring dedicated server container {Name}", containerName);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyServers(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var servers = userId.HasValue
            ? await _repo.WhereAsync(s => s.UserId == userId.Value, ct)
            : await _repo.GetAllAsync(ct);

        // Auto-seed default server if none exists so user has an immediate working server
        if (servers.Count == 0 && userId.HasValue)
        {
            var defaultServer = new DedicatedServer
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                ServerName = "Dell PowerEdge R740 Enterprise",
                CpuModel = "2x Intel Xeon Gold 6248R (48 Core / 96 Thread)",
                RamGb = 128,
                DiskBytes = 3840L * 1024 * 1024 * 1024,
                OsImage = "Ubuntu 24.04 LTS",
                Status = DedicatedServerStatus.Running,
                RemoteAccessEnabled = true,
                ProvisionedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMonths(1)
            };

            await _repo.AddAsync(defaultServer, ct);
            await _uow.SaveChangesAsync(ct);

            // Run container provisioning in background so GET response returns immediately (sub-20ms)
            _ = Task.Run(async () =>
            {
                try
                {
                    await EnsureContainerRunningAsync(defaultServer.Id, CancellationToken.None);
                }
                catch { }
            });

            servers = new List<DedicatedServer> { defaultServer };
        }

        var host = HttpContext.Request.Host.Host;
        if (string.IsNullOrWhiteSpace(host) || host == "0.0.0.0") host = "127.0.0.1";

        var result = servers.Select(s => new
        {
            id = s.Id.ToString(),
            serverName = s.ServerName,
            ipAddress = host,
            location = "Viettel IDC Song Day (Ha Noi)",
            cpuSpec = !string.IsNullOrEmpty(s.CpuModel) ? s.CpuModel : "2x Intel Xeon Gold 6248R (48 Core)",
            ramSpec = $"{s.RamGb} GB DDR4 ECC Reg",
            diskSpec = "2x 1.92TB NVMe Enterprise RAID 1",
            bandwidth = "1 Gbps Dedicated Port",
            status = s.Status.ToString(),
            powerState = s.Status == DedicatedServerStatus.Stopped ? "Stopped" : "Running",
            createdAt = s.ProvisionedAt
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var server = await _repo.GetByIdAsync(id, ct);
        if (server == null) return NotFound();

        _ = Task.Run(async () =>
        {
            try { await EnsureContainerRunningAsync(id, CancellationToken.None); } catch { }
        });

        var host = HttpContext.Request.Host.Host;
        if (string.IsNullOrWhiteSpace(host) || host == "0.0.0.0") host = "127.0.0.1";

        return Ok(new
        {
            id = server.Id.ToString(),
            serverName = server.ServerName,
            ipAddress = host,
            location = "Viettel IDC Song Day (Ha Noi)",
            cpuSpec = !string.IsNullOrEmpty(server.CpuModel) ? server.CpuModel : "2x Intel Xeon Gold 6248R (48 Core / 96 Thread)",
            ramSpec = $"{server.RamGb} GB DDR4 ECC Reg",
            diskSpec = "2x 1.92TB NVMe Enterprise RAID 1",
            bandwidth = "1 Gbps Dedicated Port",
            osImage = server.OsImage,
            status = server.Status.ToString(),
            powerState = server.Status == DedicatedServerStatus.Stopped ? "Stopped" : "Running",
            createdAt = server.ProvisionedAt,
            containerId = GetContainerName(id)
        });
    }

    public class CreateServerDto
    {
        public string ServerName { get; set; } = "Dedicated Bare Metal Server";
        public string? CpuModel { get; set; }
        public int RamGb { get; set; } = 128;
        public string? OsImage { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> CreateServer([FromBody] CreateServerDto dto, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (!userId.HasValue) return Unauthorized();

        var server = new DedicatedServer
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            ServerName = string.IsNullOrWhiteSpace(dto.ServerName) ? "Dell PowerEdge Enterprise" : dto.ServerName,
            CpuModel = string.IsNullOrWhiteSpace(dto.CpuModel) ? "2x Intel Xeon Gold 6248R" : dto.CpuModel,
            RamGb = dto.RamGb > 0 ? dto.RamGb : 128,
            DiskBytes = 3840L * 1024 * 1024 * 1024,
            OsImage = string.IsNullOrWhiteSpace(dto.OsImage) ? "Ubuntu 24.04 LTS" : dto.OsImage,
            Status = DedicatedServerStatus.Running,
            RemoteAccessEnabled = true,
            ProvisionedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMonths(1)
        };

        await _repo.AddAsync(server, ct);
        await _uow.SaveChangesAsync(ct);
        await EnsureContainerRunningAsync(server.Id, ct);

        return Ok(new { id = server.Id });
    }

    public class PowerActionRequest
    {
        public string Action { get; set; } = "reboot"; // reboot, shutdown, poweron
    }

    [HttpPost("{id:guid}/power")]
    public async Task<IActionResult> PowerAction(Guid id, [FromBody] PowerActionRequest request, CancellationToken ct)
    {
        var server = await _repo.GetByIdAsync(id, ct);
        if (server == null) return NotFound();

        var client = _dockerFactory.Client;
        var containerName = GetContainerName(id);

        if (client != null)
        {
            try
            {
                if (request.Action == "shutdown")
                {
                    await client.Containers.StopContainerAsync(containerName, new ContainerStopParameters { WaitBeforeKillSeconds = 2 }, ct);
                    server.Status = DedicatedServerStatus.Stopped;
                }
                else if (request.Action == "poweron")
                {
                    await EnsureContainerRunningAsync(id, ct);
                    server.Status = DedicatedServerStatus.Running;
                }
                else // reboot
                {
                    try { await client.Containers.RestartContainerAsync(containerName, new ContainerRestartParameters { WaitBeforeKillSeconds = 2 }, ct); }
                    catch { await EnsureContainerRunningAsync(id, ct); }
                    server.Status = DedicatedServerStatus.Running;
                }

                _repo.Update(server);
                await _uow.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Power action {Action} failed for {Container}", request.Action, containerName);
            }
        }

        return Ok(new { success = true, powerState = server.Status.ToString() });
    }

    public class ExecRequest
    {
        public string Command { get; set; } = string.Empty;
    }

    [HttpPost("{id:guid}/exec")]
    public async Task<IActionResult> Exec(Guid id, [FromBody] ExecRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Command))
            return BadRequest(new { error = "Command cannot be empty." });

        await EnsureContainerRunningAsync(id, ct);
        var client = _dockerFactory.Client;
        var containerName = GetContainerName(id);

        if (client == null) return BadRequest(new { error = "Docker Client unavailable." });

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));

            var execCreateResp = await client.Exec.ExecCreateContainerAsync(containerName, new ContainerExecCreateParameters
            {
                AttachStdout = true,
                AttachStderr = true,
                Cmd = new[] { "sh", "-c", request.Command }
            }, cts.Token);

            using var execStream = await client.Exec.StartAndAttachContainerExecAsync(execCreateResp.ID, false, cts.Token);
            var (stdout, stderr) = await execStream.ReadOutputToEndAsync(cts.Token);

            var sb = new StringBuilder();
            if (!string.IsNullOrEmpty(stdout)) sb.Append(stdout);
            if (!string.IsNullOrEmpty(stderr))
            {
                if (sb.Length > 0 && !sb.ToString().EndsWith("\n")) sb.AppendLine();
                sb.Append(stderr);
            }

            var result = sb.ToString();
            return Ok(new { output = string.IsNullOrWhiteSpace(result) ? "(Lệnh hoàn tất thành công)" : result.TrimEnd() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing command in {Container}", containerName);
            return Ok(new { output = $"[Error]: {ex.Message}" });
        }
    }

    [HttpGet("{id:guid}/logs")]
    public async Task<IActionResult> GetLogs(Guid id, [FromQuery] int tail = 100, CancellationToken ct = default)
    {
        await EnsureContainerRunningAsync(id, ct);
        var client = _dockerFactory.Client;
        var containerName = GetContainerName(id);

        if (client == null) return Ok(new { logs = Array.Empty<string>() });

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(2));

            var logParams = new ContainerLogsParameters
            {
                ShowStdout = true,
                ShowStderr = true,
                Tail = tail.ToString(),
                Timestamps = false
            };

            using var logStream = await client.Containers.GetContainerLogsAsync(containerName, false, logParams, cts.Token);
            var (stdout, stderr) = await logStream.ReadOutputToEndAsync(cts.Token);

            var lines = new List<string>();
            if (!string.IsNullOrWhiteSpace(stdout)) lines.AddRange(stdout.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries));
            if (!string.IsNullOrWhiteSpace(stderr)) lines.AddRange(stderr.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries));

            if (lines.Count == 0)
            {
                lines.Add($"[IPMI]: Dell PowerEdge R740 System Health: OK");
                lines.Add($"[Kernel]: Linux 6.8.0-enterprise x86_64 SMP");
                lines.Add($"[Network]: 1Gbps Uplink Connected to Viettel IDC Tier 3");
            }

            return Ok(new { logs = lines });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting logs for {Container}", containerName);
            return Ok(new { logs = new[] { "[IPMI]: System Online. KVM Console Ready." } });
        }
    }

    [HttpGet("{id:guid}/stats")]
    public async Task<IActionResult> GetStats(Guid id, CancellationToken ct = default)
    {
        await EnsureContainerRunningAsync(id, ct);
        var client = _dockerFactory.Client;
        var containerName = GetContainerName(id);

        double cpuPercentage = 1.2;
        double memoryUsageMb = 16.4;
        double memoryLimitMb = 128.0;

        if (client != null)
        {
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(TimeSpan.FromSeconds(2));

                var inspect = await client.Containers.InspectContainerAsync(containerName, cts.Token);
                memoryLimitMb = (inspect.HostConfig?.Memory ?? 128 * 1024 * 1024L) / (1024.0 * 1024.0);
                if (memoryLimitMb <= 0) memoryLimitMb = 128.0;
            }
            catch { }
        }

        return Ok(new
        {
            cpuPercentage,
            memoryUsageMb,
            memoryLimitMb,
            networkRxKbps = 24.5,
            networkTxKbps = 18.2,
            isRunning = true
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var server = await _repo.GetByIdAsync(id, ct);
        if (server == null) return NotFound();

        var client = _dockerFactory.Client;
        var containerName = GetContainerName(id);

        if (client != null)
        {
            try
            {
                try { await client.Containers.StopContainerAsync(containerName, new ContainerStopParameters { WaitBeforeKillSeconds = 1 }, ct); } catch { }
                await client.Containers.RemoveContainerAsync(containerName, new ContainerRemoveParameters { Force = true, RemoveVolumes = true }, ct);
            }
            catch { }
        }

        _repo.Delete(server);
        await _uow.SaveChangesAsync(ct);

        return Ok(new { success = true });
    }
}
