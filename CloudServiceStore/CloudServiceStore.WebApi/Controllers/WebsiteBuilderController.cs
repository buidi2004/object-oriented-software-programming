using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.WebsiteBuilder.Commands.CreateProject;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/website-builder")]
public class WebsiteBuilderController : ControllerBase
{
    private readonly IMediator _mediator;

    public WebsiteBuilderController(IMediator mediator) => _mediator = mediator;

    [HttpGet("projects")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyProjects(CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost("projects")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }
}
