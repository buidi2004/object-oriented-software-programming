using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.SecurityAddons.Commands.PurchaseSecurityAddon;
using CloudServiceStore.Application.Features.SecurityAddons.Commands.RunMalwareScan;
using CloudServiceStore.Application.Features.SecurityAddons.Queries.GetMySecurityAddons;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/security")]
public class SecurityController : ControllerBase
{
    private readonly IMediator _mediator;

    public SecurityController(IMediator mediator) => _mediator = mediator;

    [HttpGet("addons/me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyAddons(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMySecurityAddonsQuery(), ct);
        return Ok(result);
    }

    [HttpPost("addons")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> PurchaseAddon([FromBody] PurchaseSecurityAddonCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPost("addons/{id:guid}/scan")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> RunScan(Guid id, CancellationToken ct)
    {
        var scanId = await _mediator.Send(new RunMalwareScanCommand(id), ct);
        return Ok(new { scanId });
    }
}
