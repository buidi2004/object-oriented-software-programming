using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Security.Commands.ChangePassword;
using CloudServiceStore.Application.Features.Security.Commands.RevokeSession;
using CloudServiceStore.Application.Features.Security.Queries.GetLoginHistory;
using CloudServiceStore.Application.Features.Security.Queries.GetMySessions;
using CloudServiceStore.Application.Features.SecurityAddons.Commands.PurchaseSecurityAddon;
using CloudServiceStore.Application.Features.SecurityAddons.Commands.RunMalwareScan;
using CloudServiceStore.Application.Features.SecurityAddons.Queries.GetMySecurityAddons;
using CloudServiceStore.Application.Features.SecurityAddons.Queries.GetAllSecuritySubscriptions;
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

    [HttpGet("login-history")]
    [Authorize]
    public async Task<IActionResult> GetLoginHistory(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetLoginHistoryQuery(), ct);
        return Ok(result);
    }

    [HttpGet("sessions")]
    [Authorize]
    public async Task<IActionResult> GetSessions(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMySessionsQuery(), ct);
        return Ok(result);
    }

    [HttpDelete("sessions/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> RevokeSession(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new RevokeSessionCommand(id), ct);
        return NoContent();
    }

    [HttpGet("addons/admin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> GetAllSecurityAddonsForAdmin(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllSecuritySubscriptionsQuery(), ct);
        return Ok(result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
