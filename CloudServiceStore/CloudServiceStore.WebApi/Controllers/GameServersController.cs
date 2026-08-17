using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/game-servers")]
public class GameServersController : ControllerBase
{
    private readonly IMediator _mediator;

    public GameServersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyGameServers(CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateGameServer([FromBody] CreateGameServerCommand command, CancellationToken ct)
    {
        var serverId = await _mediator.Send(command, ct);
        return Ok(new { serverId });
    }
}
