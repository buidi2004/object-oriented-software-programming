using CloudServiceStore.Application.Features.Permissions.Commands.UpdateRolePermissions;
using CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/permissions")]
[Authorize(Roles = "Admin")]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PermissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPermissions(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllPermissionsQuery(), ct);
        return Ok(result);
    }

    [HttpPut("/api/roles/{id:guid}/permissions")]
    public async Task<IActionResult> UpdateRolePermissions(Guid id, [FromBody] UpdateRolePermissionsCommand command, CancellationToken ct)
    {
        if (id != command.RoleId) return BadRequest("Role ID mismatch");
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : BadRequest();
    }
}
