using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AutoRenew.Commands.ToggleAutoRenew;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/auto-renew")]
[Authorize]
public class AutoRenewController : ControllerBase
{
    private readonly IMediator _mediator;
    public AutoRenewController(IMediator mediator) => _mediator = mediator;

    [HttpPut("toggle")]
    public async Task<IActionResult> Toggle([FromBody] ToggleAutoRenewCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
