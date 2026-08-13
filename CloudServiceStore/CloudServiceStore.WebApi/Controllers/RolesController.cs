using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Roles.Commands.CreateRole;
using CloudServiceStore.Application.Features.Roles.Queries.GetAllRoles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly IMediator _mediator;
    public RolesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAllRoles(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllRolesQuery(), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleCommand command, CancellationToken ct)
    {
        var roleId = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetAllRoles), new { id = roleId }, new { Id = roleId });
    }
}
