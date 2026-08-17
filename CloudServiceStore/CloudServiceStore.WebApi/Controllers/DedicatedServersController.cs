using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.DedicatedServers.Commands.CreateDedicatedServer;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/dedicated-servers")]
public class DedicatedServersController : ControllerBase
{
    private readonly IMediator _mediator;

    public DedicatedServersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyServers(CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateServer([FromBody] CreateDedicatedServerCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }
}
