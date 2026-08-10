using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.PaymentMethods.Commands.DeletePaymentMethod;
using CloudServiceStore.Application.Features.PaymentMethods.Commands.SavePaymentMethod;
using CloudServiceStore.Application.Features.PaymentMethods.Queries.GetMyPaymentMethods;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/payment-methods")]
[Authorize(Roles = "Customer")]
public class PaymentMethodsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PaymentMethodsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var methods = await _mediator.Send(new GetMyPaymentMethodsQuery(), ct);
        return Ok(methods);
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SavePaymentMethodCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeletePaymentMethodCommand { PaymentMethodId = id }, ct);
        return Ok(new { success = result });
    }
}
