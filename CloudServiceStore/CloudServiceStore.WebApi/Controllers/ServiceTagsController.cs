using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CloudServiceStore.Application.Features.ServiceTags.Queries;
using CloudServiceStore.Application.Features.ServiceTags.Commands;
using CloudServiceStore.Application.Features.ServiceTags.DTOs;
using System.Security.Claims;

[Authorize]
[Route("api/service-tags")]
[ApiController]
public class ServiceTagsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ServiceTagsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<List<ServiceTagDto>>> GetAll()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new GetServiceTagsQuery(userId));
        return Ok(result);
    }

    [HttpPut("{serviceId:guid}")]
    public async Task<ActionResult<ServiceTagDto>> Update(Guid serviceId, [FromBody] UpdateServiceTagRequest body)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new UpdateServiceTagCommand(userId, serviceId, body.TagColor, body.Note));
        return Ok(result);
    }
}

public record UpdateServiceTagRequest(string TagColor, string? Note);
