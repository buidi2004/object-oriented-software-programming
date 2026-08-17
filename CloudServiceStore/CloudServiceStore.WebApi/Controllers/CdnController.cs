using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.CdnDistribution.Commands.CreateCdnDistribution;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/cdn")]
public class CdnController : ControllerBase
{
    private readonly IMediator _mediator;

    public CdnController(IMediator mediator) => _mediator = mediator;

    [HttpGet("distributions")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyDistributions(CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost("distributions")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateDistribution([FromBody] CreateCdnDistributionCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }
}
