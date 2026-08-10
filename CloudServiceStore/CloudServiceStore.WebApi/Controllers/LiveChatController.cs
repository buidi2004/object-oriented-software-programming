using CloudServiceStore.Application.Features.LiveChat.Commands.CreateSession;
using CloudServiceStore.Application.Features.LiveChat.Commands.SendMessage;
using CloudServiceStore.Application.Features.LiveChat.Queries.GetMessages;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LiveChatController : ControllerBase
{
    private readonly IMediator _mediator;

    public LiveChatController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("sessions")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateSession([FromBody] CreateChatSessionCommand command)
    {
        var sessionId = await _mediator.Send(command);
        return Ok(new { SessionId = sessionId });
    }

    [HttpPost("messages")]
    [AllowAnonymous]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageCommand command)
    {
        var messageId = await _mediator.Send(command);
        return Ok(new { MessageId = messageId });
    }

    [HttpGet("sessions/{sessionId}/messages")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSessionMessages(Guid sessionId)
    {
        var result = await _mediator.Send(new GetChatSessionMessagesQuery(sessionId));
        return Ok(result);
    }
}
