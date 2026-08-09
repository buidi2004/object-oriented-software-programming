using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Uptime.Queries.GetSystemStatus;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/status")]
public class StatusController : ControllerBase
{
    private readonly IMediator _mediator;
    public StatusController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetSystemStatus(CancellationToken ct)
    {
        var status = await _mediator.Send(new GetSystemStatusQuery(), ct);
        return Ok(status);
    }
}
