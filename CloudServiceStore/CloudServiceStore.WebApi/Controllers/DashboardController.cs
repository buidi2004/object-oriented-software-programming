using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Dashboard.Queries.GetMyDashboard;
using CloudServiceStore.Application.Features.Dashboard.Queries.GetOrderTrend;
using CloudServiceStore.Application.Features.Dashboard.Queries.GetRevenueStats;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    public DashboardController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyDashboard(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyDashboardQuery(), ct);
        return Ok(result);
    }

    [HttpGet("revenue-stats")]
    [Authorize(Roles = "Admin,Accountant,Technician,Editor,Support,Staff")]
    public async Task<IActionResult> GetRevenueStats([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRevenueStatsQuery(startDate, endDate), ct);
        return Ok(result);
    }

    [HttpGet("order-trend")]
    [Authorize(Roles = "Admin,Accountant,Technician,Editor,Support,Staff")]
    public async Task<IActionResult> GetOrderTrend([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderTrendQuery(startDate, endDate), ct);
        return Ok(result);
    }

    /// <summary>GET /api/dashboard/stats — quick admin stats summary</summary>
    [HttpGet("stats")]
    [Authorize(Roles = "Admin,Accountant,Technician,Editor,Support,Staff")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var today = DateTime.UtcNow;
        var yearStart = new DateTime(today.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var result = await _mediator.Send(new GetRevenueStatsQuery(yearStart, today), ct);
        return Ok(result);
    }

    /// <summary>GET /api/dashboard/revenue — alias for revenue-stats</summary>
    [HttpGet("revenue")]
    [Authorize(Roles = "Admin,Accountant,Technician,Editor,Support,Staff")]
    public async Task<IActionResult> GetRevenue([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, CancellationToken ct)
    {
        var end = endDate ?? DateTime.UtcNow;
        var start = startDate ?? new DateTime(end.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var result = await _mediator.Send(new GetRevenueStatsQuery(start, end), ct);
        return Ok(result);
    }
}
