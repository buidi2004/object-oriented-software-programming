using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Permissions.Commands.AssignPermissions;
using CloudServiceStore.Application.Features.Permissions.Queries.GetRolePermissions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api")]
[Authorize(Roles = "Admin")]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PermissionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("permissions")]
    public async Task<IActionResult> GetAllPermissions(CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions.GetAllPermissionsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("roles/{roleId:guid}/permissions")]
    public async Task<IActionResult> GetRolePermissions(Guid roleId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRolePermissionsQuery(roleId), ct);
        return Ok(result);
    }

    [HttpPut("roles/{roleId:guid}/permissions")]
    public async Task<IActionResult> AssignPermissions(Guid roleId, [FromBody] AssignPermissionsToRoleCommand command, CancellationToken ct)
    {
        if (roleId != command.RoleId) return BadRequest();
        
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
