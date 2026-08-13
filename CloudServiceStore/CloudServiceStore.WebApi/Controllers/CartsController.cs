using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Features.Carts.Commands.RemoveFromCart;
using CloudServiceStore.Application.Features.Carts.Commands.UpdateCartItem;
using CloudServiceStore.Application.Features.Carts.Queries.GetAbandonedCarts;
using CloudServiceStore.Application.Features.Carts.Queries.GetMyCart;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/carts")]
[Authorize(Roles = "Customer")]
public class CartsController : ControllerBase
{
    private readonly IMediator _mediator;
    public CartsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    public async Task<IActionResult> GetMyCart(CancellationToken ct)
    {
        return Ok(await _mediator.Send(new GetMyCartQuery(), ct));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddToCartCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateCartItemRequest request, CancellationToken ct)
    {
        await _mediator.Send(new UpdateCartItemCommand(id, request.Quantity), ct);
        return NoContent();
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> RemoveItem(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new RemoveFromCartCommand(id), ct);
        return NoContent();
    }

    [HttpGet("abandoned")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAbandonedCarts([FromQuery] int hoursThreshold = 24, CancellationToken ct = default)
    {
        return Ok(await _mediator.Send(new GetAbandonedCartsQuery { HoursThreshold = hoursThreshold }, ct));
    }
}

public record UpdateCartItemRequest(int Quantity);
