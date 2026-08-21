using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/game-servers")]
[Authorize(Roles = "Admin")]
public class AdminGameServersController : ControllerBase
{
    private readonly IRepository<GameServerInstance> _repo;
    private readonly IUnitOfWork _uow;
    private readonly IResourceProvisioningQueue _taskQueue;

    public AdminGameServersController(
        IRepository<GameServerInstance> repo,
        IUnitOfWork uow,
        IResourceProvisioningQueue taskQueue)
    {
        _repo = repo;
        _uow = uow;
        _taskQueue = taskQueue;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var host = HttpContext.Request.Host.Host;
        if (string.IsNullOrWhiteSpace(host) || host == "0.0.0.0")
        {
            host = "127.0.0.1";
        }

        var servers = await _repo.WhereAsync(s => true, ct, s => s.User!);

        var result = servers.Select(s => new
        {
            id = s.Id,
            serverName = s.ServerName,
            name = s.ServerName,
            ownerEmail = s.User?.Email ?? "customer@cloudhost.vn",
            gameType = (int)s.GameType,
            gameTypeName = s.GameType.ToString(),
            ipAddress = host,
            port = s.Port,
            containerId = s.ContainerId,
            status = s.Status.ToString(),
            failureReason = s.FailureReason,
            createdAt = s.CreatedAt
        }).OrderByDescending(s => s.createdAt);

        return Ok(result);
    }

    [HttpPost("{id:guid}/restart")]
    public async Task<IActionResult> RestartServer(Guid id, CancellationToken cancellationToken)
    {
        var server = await _repo.GetByIdAsync(id, cancellationToken);
        if (server == null) return NotFound("Không tìm thấy Game Server.");

        server.MarkAsProvisioning();
        await _uow.SaveChangesAsync(cancellationToken);

        var serverId = server.Id;
        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedRepo = serviceProvider.GetRequiredService<IRepository<GameServerInstance>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IGameServerProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbServer = await scopedRepo.GetByIdAsync(serverId, ct);
            if (dbServer == null) return;

            try
            {
                int assignedPort = await scopedProvService.ProvisionGameServerAsync(dbServer, ct);
                if (assignedPort > 0)
                {
                    dbServer.MarkAsRunning(assignedPort);
                }
                else
                {
                    dbServer.MarkAsFailed("Lỗi khi khởi động lại Game Server.");
                }
            }
            catch (Exception ex)
            {
                dbServer.MarkAsFailed($"Lỗi restart: {ex.Message}");
            }

            await scopedUow.SaveChangesAsync(ct);
            await scopedNotifier.NotifyStatusChangedAsync("GameServerInstance", dbServer.Id.ToString(), dbServer.Status.ToString());
        });

        return Ok(new { success = true, message = "Đã gửi lệnh restart Game Server container." });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteServer(Guid id, CancellationToken cancellationToken)
    {
        var server = await _repo.GetByIdAsync(id, cancellationToken);
        if (server == null) return NotFound();

        _repo.Delete(server);
        await _uow.SaveChangesAsync(cancellationToken);

        return Ok(new { success = true });
    }
}
