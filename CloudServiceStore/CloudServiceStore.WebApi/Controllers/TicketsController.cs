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
    public async Task<IActionResult> AddMessage(Guid id, [FromBody] AddTicketMessageRequest body, CancellationToken ct)
    {
        var command = new AddTicketMessageCommand(id, body.Message);
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
