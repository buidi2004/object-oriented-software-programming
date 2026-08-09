using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Migrations.Commands.CreateMigration;
using CloudServiceStore.Application.Features.Migrations.Commands.UpdateMigrationStatus;
using CloudServiceStore.Application.Features.Migrations.Queries.GetMyMigrations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/migration-requests")]
public class MigrationRequestsController : ControllerBase
{
    private readonly IMediator _mediator;
    public MigrationRequestsController(IMediator mediator) => _mediator = mediator;

    [Authorize(Roles = "Customer")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyMigrations(CancellationToken ct)
    {
        var migrations = await _mediator.Send(new GetMyMigrationsQuery(), ct);
        return Ok(migrations);
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> CreateMigration([FromBody] CreateMigrationCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { migrationId = id });
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateMigrationStatusCommand command, CancellationToken ct)
    {
        if (id != command.Id) return BadRequest("Mismatched Id");
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
