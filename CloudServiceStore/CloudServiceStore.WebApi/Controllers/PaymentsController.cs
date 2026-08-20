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

    [HttpPost("webhook/sepay")]
    [AllowAnonymous]
    public async Task<IActionResult> SePayWebhook([FromBody] CloudServiceStore.Application.DTOs.SePayWebhookPayload payload, [FromServices] Microsoft.Extensions.Configuration.IConfiguration config, CancellationToken ct)
    {
        // 1. Verify API Key (supports "Apikey <key>", "Bearer <key>", or direct key in Authorization / X-SePay-ApiKey header)
        var expectedApiKey = config["SePay:ApiKey"] ?? string.Empty;
        var authHeader = Request.Headers["Authorization"].ToString().Trim();
        var xApiKey = Request.Headers["X-SePay-ApiKey"].ToString().Trim();
        
        var isValidKey = !string.IsNullOrEmpty(expectedApiKey) && (
            authHeader.Equals($"Apikey {expectedApiKey}", StringComparison.OrdinalIgnoreCase) ||
            authHeader.Equals($"Bearer {expectedApiKey}", StringComparison.OrdinalIgnoreCase) ||
            authHeader.Equals(expectedApiKey, StringComparison.OrdinalIgnoreCase) ||
            xApiKey.Equals(expectedApiKey, StringComparison.OrdinalIgnoreCase));

        if (!isValidKey)
        {
            return Unauthorized(new { message = "Invalid API Key" });
        }

        // 2. Ignore outgoing transfers
        if (payload.TransferType != "in")
        {
            return Ok(new { message = "Ignored outgoing transfer" });
        }

        // 3. Extract Payment Code or Order ID from Content
        // Assuming the customer writes "PAY..." or just the Order Guid in the bank transfer content
        var match = System.Text.RegularExpressions.Regex.Match(payload.Content, @"(?i)(PAY[a-zA-Z0-9_-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})");
        var idempotencyKey = match.Success ? match.Value : payload.Content.Trim();

        var command = new ConfirmPaymentWebhookCommand(idempotencyKey, payload.TransferAmount);
        await _mediator.Send(command, ct);

        return Ok(new { success = true, message = "SePay Webhook processed" });
    }

    [HttpPost("sandbox/simulate-sepay")]
    [AllowAnonymous]
    public async Task<IActionResult> SimulateSePay([FromBody] SimulateSePayRequest request, CancellationToken ct)
    {
        var command = new ConfirmPaymentWebhookCommand(request.IdempotencyKey, request.Amount);
        await _mediator.Send(command, ct);
        return Ok(new { success = true, message = "Sandbox SePay payment simulated successfully!" });
    }

    [HttpPost("webhook/momo")]
    [AllowAnonymous]
    public async Task<IActionResult> MomoWebhook([FromBody] MomoWebhookPayload payload, CancellationToken ct)
    {
        if (payload.ResultCode != 0)
        {
            return Ok(new { message = $"MoMo payment not successful. Code: {payload.ResultCode}", resultCode = payload.ResultCode });
        }

        var match = System.Text.RegularExpressions.Regex.Match(payload.OrderId, @"(?i)(PAY_[a-zA-Z0-9_-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})");
        var idempotencyKey = match.Success ? match.Value : payload.OrderId.Trim();

        var command = new ConfirmPaymentWebhookCommand(idempotencyKey, payload.Amount);
        await _mediator.Send(command, ct);

        return Ok(new { message = "MoMo Webhook processed", resultCode = 0 });
    }
}

public class SimulateSePayRequest
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class MomoWebhookPayload
{
    public string PartnerCode { get; set; } = "MOMO";
    public string OrderId { get; set; } = string.Empty;
    public string RequestId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string OrderInfo { get; set; } = string.Empty;
    public int ResultCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string TransId { get; set; } = string.Empty;
}
