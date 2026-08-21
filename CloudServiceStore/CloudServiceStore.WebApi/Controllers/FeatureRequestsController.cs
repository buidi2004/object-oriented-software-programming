using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CloudServiceStore.Application.Features.FeatureRequests.Queries;
using CloudServiceStore.Application.Features.FeatureRequests.Commands;
using CloudServiceStore.Application.Features.FeatureRequests.DTOs;
using System.Security.Claims;

[Authorize]
[Route("api/feature-requests")]
[ApiController]
public class FeatureRequestsController : ControllerBase
{
    private readonly IMediator _mediator;
    public FeatureRequestsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<List<FeatureRequestDto>>> GetAll()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new ListFeatureRequestsQuery(userId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<FeatureRequestDto>> Create([FromBody] CreateFeatureRequestBody body)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new CreateFeatureRequestCommand(userId, body.Title, body.Description));
        return Ok(result);
    }

    [HttpPost("{id:guid}/vote")]
    public async Task<IActionResult> Vote(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new VoteFeatureRequestCommand(userId, id));
        return Ok(new { success = result });
    }
}

public record CreateFeatureRequestBody(string Title, string Description);
