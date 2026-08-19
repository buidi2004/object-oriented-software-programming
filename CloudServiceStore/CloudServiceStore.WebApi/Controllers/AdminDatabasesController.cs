using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ManagedDatabases.Queries.GetAdminDatabases;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/databases")]
[Authorize(Roles = "Admin")]
public class AdminDatabasesController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminDatabasesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDatabases(CancellationToken ct)
    {
        var databases = await _mediator.Send(new GetAdminDatabasesQuery(), ct);
        return Ok(databases);
    }
}
