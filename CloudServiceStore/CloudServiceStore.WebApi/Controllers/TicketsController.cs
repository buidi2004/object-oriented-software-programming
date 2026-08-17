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
    public async Task<IActionResult> AddMessage(Guid id, [FromBody] AddTicketMessageRequest dto, CancellationToken ct)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { message = "Nội dung tin nhắn không được để trống." });

        var command = new AddTicketMessageCommand(id, dto.Message, dto.AttachmentUrl);
        var messageId = await _mediator.Send(command, ct);
        return Ok(new { id = messageId });
    }

    [HttpPost("attachments")]
    [Authorize]
    public async Task<IActionResult> UploadAttachment(IFormFile file, [FromServices] IWebHostEnvironment env, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không tìm thấy file tải lên." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "Kích thước file không được vượt quá 5MB." });

        var uploadsFolder = Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "tickets");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var attachmentUrl = $"/images/tickets/{fileName}";
        return Ok(new { url = attachmentUrl });
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

public record AddTicketMessageRequest(string Message, string? AttachmentUrl = null);
public record AssignTicketRequest(Guid StaffId);
