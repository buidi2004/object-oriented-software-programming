using System;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GameServers.Commands.CreateGameServer;
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

    public GameServersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateGameServer([FromBody] CreateGameServerCommand command)
    {
        var serverId = await _mediator.Send(command);
        return Ok(new { serverId });
    }
}
