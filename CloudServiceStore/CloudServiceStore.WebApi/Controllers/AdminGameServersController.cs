using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/game-servers")]
[Authorize(Roles = "Admin")]
public class AdminGameServersController : ControllerBase
{
    private readonly IRepository<GameServerInstance> _repo;

    public AdminGameServersController(IRepository<GameServerInstance> repo)
    {
        _repo = repo;
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
}
