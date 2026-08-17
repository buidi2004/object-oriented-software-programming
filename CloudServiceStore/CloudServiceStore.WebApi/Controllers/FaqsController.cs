using CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;
using CloudServiceStore.Application.Features.Faqs.Commands.DeleteFaqItem;
using CloudServiceStore.Application.Features.Faqs.Commands.UpdateFaqItem;
using CloudServiceStore.Application.Features.Faqs.Queries.GetAllFaqs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/faqs")]
public class FaqsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FaqsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllFaqsQuery());
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateFaqItemCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFaqItemCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id in route does not match Id in command");

        var result = await _mediator.Send(command);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteFaqItemCommand(id));
        if (!result)
            return NotFound();

        return NoContent();
    }
}
