using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.FeatureRequests.Commands.CreateFeatureRequest;
using CloudServiceStore.Application.Features.FeatureRequests.Commands.ToggleUpvoteFeature;
using CloudServiceStore.Application.Features.FeatureRequests.Queries.GetFeatureRequests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/feature-requests")]
public class FeatureRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FeatureRequestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetList([FromQuery] string? status, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFeatureRequestsQuery(status), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateFeatureRequestCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPost("{id:guid}/upvote")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> ToggleUpvote(Guid id, CancellationToken ct)
    {
        var isUpvoted = await _mediator.Send(new ToggleUpvoteFeatureCommand(id), ct);
        return Ok(new { isUpvoted });
    }
}
