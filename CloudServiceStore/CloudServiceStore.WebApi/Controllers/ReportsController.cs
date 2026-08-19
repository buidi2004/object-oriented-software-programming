using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Reports.Queries.GetSpendingBreakdown;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Customer")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("spending-breakdown")]
    public async Task<IActionResult> GetSpendingBreakdown([FromQuery] int months = 6, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetSpendingBreakdownQuery(months), ct);
        return Ok(result);
    }
}
