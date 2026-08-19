using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Resources.Commands.TrackResourceDownload;
using CloudServiceStore.Application.Features.Resources.Queries.GetDownloadableResources;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/resources")]
public class ResourcesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ResourcesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDownloadableResourcesQuery(keyword), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/download")]
    [Authorize]
    public async Task<IActionResult> TrackDownload(Guid id, CancellationToken ct)
    {
        var downloadCount = await _mediator.Send(new TrackResourceDownloadCommand(id), ct);
        return Ok(new { downloadCount });
    }
}
