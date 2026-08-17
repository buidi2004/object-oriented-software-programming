using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.DatabaseInstances.Commands.CreateDatabaseInstance;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/databases")]
public class DatabasesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<DatabaseInstance> _repo;

    public DatabasesController(IMediator mediator, IRepository<DatabaseInstance> repo)
    {
        _mediator = mediator;
        _repo = repo;
    }

    [HttpGet]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyDatabases(CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateDatabase([FromBody] CreateDatabaseInstanceCommand command, CancellationToken ct)
    {
        var instanceId = await _mediator.Send(command, ct);
        return Ok(new { instanceId });
    }
}
