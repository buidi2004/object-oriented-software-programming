using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Tickets.Commands.AddMessage;
using CloudServiceStore.Application.Features.Tickets.Commands.AssignTicket;
using CloudServiceStore.Application.Features.Tickets.Commands.CloseTicket;
using CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;
using CloudServiceStore.Application.Features.Tickets.Queries.GetMyTickets;
using CloudServiceStore.Application.Features.Tickets.Queries.GetTicketQueue;
using CloudServiceStore.Application.Features.Tickets.Queries.GetTicketById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController : ControllerBase
{
    private readonly IMediator _mediator;
    public TicketsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateTicketCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(null, new { id });
    }

    [HttpPost("{id:guid}/messages")]
    [Authorize]
    public async Task<IActionResult> AddMessage(Guid id, [FromForm] string message, IFormFile? attachment, [FromServices] IWebHostEnvironment env, CancellationToken ct)
    {
        string? attachmentUrl = null;
        if (attachment != null && attachment.Length > 0)
        {
            if (attachment.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Kích thước file không được vượt quá 5MB." });

            var uploadsFolder = Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "tickets");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(attachment.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await attachment.CopyToAsync(stream, ct);
            }
            attachmentUrl = $"/images/tickets/{fileName}";
        }

        var command = new AddTicketMessageCommand(id, message, attachmentUrl);
        var messageId = await _mediator.Send(command, ct);
        return CreatedAtAction(null, new { id = messageId });
    }

    [HttpPatch("{id:guid}/close")]
    [Authorize]
    public async Task<IActionResult> Close(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CloseTicketCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTicketRequest body, CancellationToken ct)
    {
        await _mediator.Send(new AssignTicketCommand(id, body.StaffId), ct);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyTickets(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyTicketsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("queue")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetQueue(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTicketQueueQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTicketByIdQuery(id), ct);
        return Ok(result);
    }
}

public record AddTicketMessageRequest(string Message);
public record AssignTicketRequest(Guid StaffId);
