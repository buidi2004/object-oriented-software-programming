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
        // Verify HMAC to block fake webhooks (IdempotencyKey signed with a secret)
        var signature = Request.Headers["X-VNPAY-Signature"].ToString();
        if (string.IsNullOrEmpty(signature))
        {
            return BadRequest(new { message = "Missing signature" });
        }

        // Mock secret key
        var secret = "vnpay_secret_key_123";
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
        var hashBytes = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(command.IdempotencyKey));
        var expectedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        if (signature.ToLower() != expectedSignature)
        {
            return BadRequest(new { message = "Invalid signature" });
        }

        await _mediator.Send(command, ct);
        return Ok(new { message = "Webhook processed" });
    }
}
