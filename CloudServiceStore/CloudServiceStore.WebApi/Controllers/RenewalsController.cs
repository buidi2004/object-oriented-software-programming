using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Renewals.Queries.GetRenewalCalendar;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/renewals")]
[Authorize(Roles = "Customer")]
public class RenewalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RenewalsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendar([FromQuery] int? month, [FromQuery] int? year, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRenewalCalendarQuery(month, year), ct);
        return Ok(result);
    }
}
