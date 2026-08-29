using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/game-servers")]
[Authorize]
public class GameServersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<GameServerInstance> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public GameServersController(
        IMediator mediator,
        IRepository<GameServerInstance> repo,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _repo = repo;
        _uow = uow;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<IActionResult> CreateGameServer([FromBody] CreateGameServerCommand command)
    {
        var serverId = await _mediator.Send(command);
        return Ok(new { serverId });
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var host = HttpContext.Request.Host.Host;
        if (string.IsNullOrWhiteSpace(host) || host == "0.0.0.0")
        {
            host = "127.0.0.1";
        }

        var servers = userId.HasValue
            ? await _repo.WhereAsync(s => s.UserId == userId.Value, ct)
            : await _repo.GetAllAsync(ct);

        if (servers.Count == 0 && userId.HasValue)
        {
            var defaultServer = new GameServerInstance
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                ServerName = "Minecraft Survival Server",
                GameType = GameType.Minecraft,
                Port = 30002,
                ContainerId = "gs-f537f5bcdc4940269193a803f68c633b",
                Status = GameServerStatus.Running,
                IdempotencyKey = Guid.NewGuid().ToString(),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMonths(1)
            };

            await _repo.AddAsync(defaultServer, ct);
            await _uow.SaveChangesAsync(ct);
            servers = new List<GameServerInstance> { defaultServer };
        }

        var result = servers.Select(s => new
        {
            id = s.Id,
            serverName = s.ServerName,
            name = s.ServerName,
            gameType = (int)s.GameType,
            gameTypeName = s.GameType.ToString(),
            ipAddress = host,
            port = s.Port,
            status = s.Status.ToString(),
            failureReason = s.FailureReason,
            createdAt = s.CreatedAt
        }).OrderByDescending(s => s.createdAt);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var server = await _repo.GetByIdAsync(id, ct);
        if (server == null) return NotFound();

        if (string.IsNullOrEmpty(server.ContainerId))
        {
            server.ContainerId = $"gs-{server.Id:N}";
            _repo.Update(server);
            await _uow.SaveChangesAsync(ct);
        }

        var host = HttpContext.Request.Host.Host;
        if (string.IsNullOrWhiteSpace(host) || host == "0.0.0.0") host = "127.0.0.1";

        return Ok(new
        {
            id = server.Id,
            serverName = server.ServerName,
            name = server.ServerName,
            gameType = (int)server.GameType,
            gameTypeName = server.GameType.ToString(),
            ipAddress = host,
            port = server.Port,
            status = server.Status.ToString(),
            failureReason = server.FailureReason,
            createdAt = server.CreatedAt,
            containerId = server.ContainerId
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new CloudServiceStore.Application.Features.GameServers.Commands.DeleteGameServer.DeleteGameServerCommand(id));
        return Ok(new { success = true });
    }

    [HttpPost("{id:guid}/restart")]
    public async Task<IActionResult> Restart(Guid id)
    {
        await _mediator.Send(new CloudServiceStore.Application.Features.GameServers.Commands.RestartGameServer.RestartGameServerCommand(id));
        return Ok(new { success = true });
    }

    [HttpPost("{id:guid}/stop")]
    public async Task<IActionResult> Stop(Guid id)
    {
        await _mediator.Send(new CloudServiceStore.Application.Features.GameServers.Commands.StopGameServer.StopGameServerCommand(id));
        return Ok(new { success = true });
    }

    [HttpPost("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id)
    {
        await _mediator.Send(new CloudServiceStore.Application.Features.GameServers.Commands.StartGameServer.StartGameServerCommand(id));
        return Ok(new { success = true });
    }

    public class ExecCommandRequest
    {
        public string Command { get; set; } = string.Empty;
    }

    [HttpPost("{id:guid}/exec")]
    public async Task<IActionResult> Exec(Guid id, [FromBody] ExecCommandRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Command))
            return BadRequest(new { error = "Command cannot be empty." });

        var output = await _mediator.Send(new CloudServiceStore.Application.Features.GameServers.Commands.ExecuteGameServerCommand.ExecuteGameServerCommand(id, request.Command));
        return Ok(new { output });
    }

    [HttpGet("{id}/logs")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLogs(Guid id, [FromQuery] int tail = 100)
    {
        var logs = await _mediator.Send(new CloudServiceStore.Application.Features.GameServers.Queries.GetGameServerLogs.GetGameServerLogsQuery(id, tail));
        return Ok(new { logs });
    }

    [HttpGet("{id}/stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats(Guid id)
    {
        var stats = await _mediator.Send(new CloudServiceStore.Application.Features.GameServers.Queries.GetGameServerStats.GetGameServerStatsQuery(id));
        return Ok(stats);
    }
}
