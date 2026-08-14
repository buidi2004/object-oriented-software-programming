using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Security.Commands.ChangePassword;
using CloudServiceStore.Application.Features.Security.Commands.RevokeSession;
using CloudServiceStore.Application.Features.Security.Queries.GetLoginHistory;
using CloudServiceStore.Application.Features.Security.Queries.GetMySessions;
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

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
