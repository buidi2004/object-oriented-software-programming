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
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyDashboard(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyDashboardQuery(), ct);
        return Ok(result);
    }

    [HttpGet("revenue-stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetRevenueStats([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRevenueStatsQuery(startDate, endDate), ct);
        return Ok(result);
    }

    [HttpGet("order-trend")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOrderTrend([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderTrendQuery(startDate, endDate), ct);
        return Ok(result);
    }
}
