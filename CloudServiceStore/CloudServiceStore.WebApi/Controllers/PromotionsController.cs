using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;
using CloudServiceStore.Application.Features.Promotions.Commands.DeletePromotion;
using CloudServiceStore.Application.Features.Promotions.Commands.UpdatePromotion;
using CloudServiceStore.Application.Features.Promotions.Queries.GetPromotions;
using CloudServiceStore.Application.Features.Promotions.Queries.GetActivePromotions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/promotions")]
public class PromotionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PromotionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPromotionsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetActivePromotionsQuery(), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePromotionCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(null, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePromotionRequest body, CancellationToken ct)
    {
        var command = new UpdatePromotionCommand(id, body.ServicePlanId, body.DiscountPercent, body.StartDate, body.EndDate);
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeletePromotionCommand(id), ct);
        return NoContent();
    }
}

public record UpdatePromotionRequest(Guid? ServicePlanId, decimal DiscountPercent, DateTime StartDate, DateTime EndDate);
