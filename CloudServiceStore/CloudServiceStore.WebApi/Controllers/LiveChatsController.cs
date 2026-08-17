using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.LiveChats.Commands.CloseChatSession;
using CloudServiceStore.Application.Features.LiveChats.Commands.SendChatMessage;
using CloudServiceStore.Application.Features.LiveChats.Commands.StartChatSession;
using CloudServiceStore.Application.Features.LiveChats.Queries.GetSessionMessages;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/chats")]
[Route("api/live-chats")]
[Authorize]
public class LiveChatsController : ControllerBase
{
    private readonly IMediator _mediator;
    public LiveChatsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> StartSession(CancellationToken ct)
    {
        var id = await _mediator.Send(new StartChatSessionCommand(), ct);
        return CreatedAtAction(null, new { id });
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] string message, CancellationToken ct)
    {
        var msgId = await _mediator.Send(new SendChatMessageCommand(id, message), ct);
        return CreatedAtAction(null, new { id = msgId });
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSessionMessagesQuery(id), ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/close")]
    public async Task<IActionResult> CloseSession(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CloseChatSessionCommand(id), ct);
        return NoContent();
    }

    [HttpGet("active")]
    [HttpGet("admin/active")]
    [Authorize] // Can add Role check here if needed (e.g. Admin or Editor)
    public async Task<IActionResult> GetActiveSessions(CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.LiveChats.Queries.GetActiveSessions.GetActiveSessionsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("my-active")]
    public async Task<IActionResult> GetMyActiveSession(CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.LiveChats.Queries.GetMyActiveSession.GetMyActiveSessionQuery(), ct);
        if (result.HasValue)
        {
            return Ok(new { id = result.Value });
        }
        return NotFound();
    }
}
