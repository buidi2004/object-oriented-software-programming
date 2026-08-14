using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ControlPanels.Commands.UpdateCredentials;
using CloudServiceStore.Application.Features.ControlPanels.Queries.GetCredentials;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/orders/{orderId}/control-panel")]
public class ControlPanelController : ControllerBase
{
    private readonly IMediator _mediator;
    public ControlPanelController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetCredentials(Guid orderId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetControlPanelCredentialsQuery(orderId), ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateCredentials(Guid orderId, [FromBody] UpdateControlPanelCredentialsCommand command, CancellationToken ct)
    {
        if (orderId != command.OrderId) return BadRequest("OrderId mismatch");
        var result = await _mediator.Send(command, ct);
        return Ok(new { Id = result });
    }
}
