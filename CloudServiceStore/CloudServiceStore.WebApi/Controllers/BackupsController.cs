using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using CloudServiceStore.Application.Features.Backups.Queries.GetBackupsForOrder;
using CloudServiceStore.Application.Features.Backups.Queries.GetMyBackups;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/backups")]
[Authorize]
public class BackupsController : ControllerBase
{
    private readonly IMediator _mediator;
    public BackupsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetBackupsForOrder(Guid orderId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetBackupsForOrderQuery(orderId), ct);
        return Ok(result);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyBackups(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyBackupsQuery(), ct);
        return Ok(result);
    }

    [HttpPost("schedule")]
    public async Task<IActionResult> ScheduleBackup([FromBody] ScheduleBackupCommand command, CancellationToken ct)
    {
        var resultId = await _mediator.Send(command, ct);
        return Ok(new { BackupId = resultId, Message = "Backup scheduled successfully." });
    }
}
