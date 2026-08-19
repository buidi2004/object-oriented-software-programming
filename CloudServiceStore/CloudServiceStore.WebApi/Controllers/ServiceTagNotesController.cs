using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ServiceTagNotes.Commands.UpdateServiceTagNote;
using CloudServiceStore.Application.Features.ServiceTagNotes.Queries.GetServiceTagNotes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/services")]
[Authorize(Roles = "Customer")]
public class ServiceTagNotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServiceTagNotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPut("{serviceType}/{serviceId:guid}/tag-note")]
    public async Task<IActionResult> UpdateTagNote(
        string serviceType,
        Guid serviceId,
        [FromBody] UpdateServiceTagNoteBody body,
        CancellationToken ct)
    {
        await _mediator.Send(new UpdateServiceTagNoteCommand(serviceType, serviceId, body.TagsJson, body.ColorHex, body.Note), ct);
        return NoContent();
    }

    [HttpGet("{serviceType}/{serviceId:guid}/tag-note")]
    public async Task<IActionResult> GetTagNote(string serviceType, Guid serviceId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetServiceTagNotesQuery(serviceType, serviceId), ct);
        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    public record UpdateServiceTagNoteBody(string? TagsJson, string? ColorHex, string? Note);
}
