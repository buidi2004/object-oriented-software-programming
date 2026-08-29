using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CloudServiceStore.Application.Features.SpendingReports.Queries;
using CloudServiceStore.Application.Features.SpendingReports.DTOs;
using System.Security.Claims;

[Authorize]
[Route("api/spending-reports")]
[ApiController]
public class SpendingReportsController : ControllerBase
{
    private readonly IMediator _mediator;
    public SpendingReportsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("monthly")]
    public async Task<ActionResult<MonthlySpendingDto>> GetMonthly([FromQuery] int month, [FromQuery] int year)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new GetMonthlySpendingQuery(month, year, userId));
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<ActionResult<MonthlySpendingDto>> GetCurrentMonth()
    {
        var now = DateTime.UtcNow;
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new GetMonthlySpendingQuery(now.Month, now.Year, userId));
        return Ok(result);
    }
}
