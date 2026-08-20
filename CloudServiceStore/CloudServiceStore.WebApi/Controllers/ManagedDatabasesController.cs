using System;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ManagedDatabases.Commands.CreateDatabase;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/managed-databases")]
[Authorize]
public class ManagedDatabasesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ManagedDatabasesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDatabase([FromBody] CreateDatabaseCommand command)
    {
        var databaseId = await _mediator.Send(command);
        return Ok(new { databaseId });
    }
}
