using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Uptime.Queries.GetOrderUptime;
using CloudServiceStore.Application.Features.Uptime.Queries.GetSystemStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/uptime")]
public class UptimeController : ControllerBase
{
    private readonly IMediator _mediator;
    public UptimeController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [HttpGet("system")]
    [HttpGet("summary")]
    public async Task<IActionResult> GetSystemStatus(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSystemStatusQuery(), ct);
        return Ok(result);
    }

    [HttpGet("order/{orderId}")]
    [Authorize]
    public async Task<IActionResult> GetOrderUptime(Guid orderId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderUptimeQuery(orderId), ct);
        return Ok(result);
    }
}
