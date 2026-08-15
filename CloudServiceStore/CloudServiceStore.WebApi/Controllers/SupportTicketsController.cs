using CloudServiceStore.Application.Features.SupportTickets.Commands.AddTicketMessage;
using CloudServiceStore.Application.Features.SupportTickets.Commands.AssignTicket;
using CloudServiceStore.Application.Features.SupportTickets.Commands.CloseTicket;
using CloudServiceStore.Application.Features.SupportTickets.Commands.CreateTicket;
using CloudServiceStore.Application.Features.SupportTickets.Queries.GetAllTickets;
using CloudServiceStore.Application.Features.SupportTickets.Queries.GetMyTickets;
using CloudServiceStore.Application.Features.SupportTickets.Queries.GetTicketById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/support-tickets")]
[Authorize]
public class SupportTicketsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SupportTicketsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateTicketCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyTickets()
    {
        var result = await _mediator.Send(new GetMyTicketsQuery());
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllTicketsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetTicketByIdQuery(id));
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost("{id}/messages")]
    [Authorize]
    public async Task<IActionResult> AddMessage(Guid id, [FromBody] AddTicketMessageCommand command)
    {
        if (id != command.TicketId)
            return BadRequest("Id in route does not match TicketId in command");

        var result = await _mediator.Send(command);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/assign")]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTicketCommand command)
    {
        if (id != command.TicketId)
            return BadRequest("Id in route does not match TicketId in command");

        var result = await _mediator.Send(command);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/close")]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> Close(Guid id)
    {
        var result = await _mediator.Send(new CloseTicketCommand(id));
        if (!result)
            return NotFound();

        return NoContent();
    }
}
