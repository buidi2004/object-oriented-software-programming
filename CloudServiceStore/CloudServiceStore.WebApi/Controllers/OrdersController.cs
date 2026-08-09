using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using CloudServiceStore.Application.Features.Backups.Queries.GetBackupsForOrder;
using CloudServiceStore.Application.Features.Uptime.Queries.GetOrderUptime;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize(Roles = "Customer")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutCommand command, CancellationToken ct)
    {
        var orderId = await _mediator.Send(command, ct);
        return Ok(new { orderId });
    }

    // --- BACKUPS ---

    [HttpGet("{id:guid}/backups")]
    public async Task<IActionResult> GetBackups(Guid id, CancellationToken ct)
    {
        var backups = await _mediator.Send(new GetBackupsForOrderQuery(id), ct);
        return Ok(backups);
    }

    [HttpPost("{id:guid}/backups/schedule")]
    public async Task<IActionResult> ScheduleBackup(Guid id, [FromBody] ScheduleBackupCommand command, CancellationToken ct)
    {
        if (id != command.OrderId) return BadRequest("Mismatched Order Id");
        var backupId = await _mediator.Send(command, ct);
        return Ok(new { backupId });
    }

    // --- UPTIME ---

    [HttpGet("{id:guid}/uptime")]
    public async Task<IActionResult> GetOrderUptime(Guid id, CancellationToken ct)
    {
        var uptime = await _mediator.Send(new GetOrderUptimeQuery(id), ct);
        return Ok(uptime);
    }

    [HttpPatch("{id:guid}/auto-renew")]
    public async Task<IActionResult> ToggleAutoRenew(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.AutoRenew.Commands.ToggleAutoRenew.ToggleAutoRenewCommand(id), ct);
        return Ok(new { success = result });
    }
}
