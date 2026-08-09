using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Payments.Commands.CreatePayment;
using CloudServiceStore.Application.Features.Payments.Commands.ConfirmPaymentWebhook;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PaymentsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command, CancellationToken ct)
    {
        var paymentUrl = await _mediator.Send(command, ct);
        return Ok(new { url = paymentUrl });
    }

    [HttpPost("webhook/vnpay")]
    public async Task<IActionResult> VnpayWebhook([FromBody] ConfirmPaymentWebhookCommand command, CancellationToken ct)
    {
        // Ideally verify HMAC here before processing
        await _mediator.Send(command, ct);
        return Ok(new { message = "Webhook processed" });
    }
}
