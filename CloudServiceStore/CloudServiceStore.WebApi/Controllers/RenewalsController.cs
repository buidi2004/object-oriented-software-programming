using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CloudServiceStore.Application.Features.Renewals.Queries;
using CloudServiceStore.Application.Features.Renewals.DTOs;
using System.Security.Claims;

[Authorize]
[Route("api/renewals")]
[ApiController]
public class RenewalsController : ControllerBase
{
    private readonly IMediator _mediator;
    public RenewalsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("calendar")]
    public async Task<ActionResult<List<RenewalEventDto>>> GetCalendar([FromQuery] int month, [FromQuery] int year)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new GetRenewalCalendarQuery(month, year, userId));
        return Ok(result);
    }
}