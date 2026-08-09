using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize(Roles = "Customer")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutCommand command, CancellationToken ct)
    {
        var orderId = await _mediator.Send(command, ct);
        return Ok(new { orderId });
    }
}
