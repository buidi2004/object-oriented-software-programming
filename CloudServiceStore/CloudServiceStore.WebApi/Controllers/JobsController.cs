using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AutoRenew.Commands.ProcessAutoRenewals;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize(Roles = "Admin")]
public class JobsController : ControllerBase
{
    private readonly IMediator _mediator;
    public JobsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("process-renewals")]
    public async Task<IActionResult> ProcessAutoRenewals(CancellationToken ct)
    {
        var count = await _mediator.Send(new ProcessAutoRenewalsCommand(), ct);
        return Ok(new { message = $"Processed {count} renewals successfully." });
    }
}
