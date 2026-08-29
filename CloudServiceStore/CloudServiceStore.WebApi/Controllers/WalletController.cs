using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Wallet.Commands.PayWithWallet;
using CloudServiceStore.Application.Features.Wallet.Commands.TopUpWallet;
using CloudServiceStore.Application.Features.Wallet.Queries.GetMyWallet;
using CloudServiceStore.Application.Features.Wallet.Queries.GetMyWalletTransactions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/wallet")]
[Authorize]
public class WalletController : ControllerBase
{
    private readonly IMediator _mediator;
    public WalletController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyWallet(CancellationToken ct)
    {
        var wallet = await _mediator.Send(new GetMyWalletQuery(), ct);
        return Ok(wallet);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetMyTransactions(CancellationToken ct)
    {
        var transactions = await _mediator.Send(new GetMyWalletTransactionsQuery(), ct);
        return Ok(transactions);
    }

    // Ghi chú: Trong thực tế Endpoint này sẽ được gọi ẩn (Webhook) từ cổng thanh toán. 
    // Tuy nhiên đây là chức năng cho demo nạp tiền.
    [HttpPost("top-up")]
    public async Task<IActionResult> TopUp([FromBody] TopUpWalletCommand command, CancellationToken ct)
    {
        if (command.Amount <= 0) return BadRequest("Số tiền nạp phải lớn hơn 0.");
        var success = await _mediator.Send(command, ct);
        return Ok(new { success });
    }

    [HttpPost("pay")]
    public async Task<IActionResult> PayWithWallet([FromBody] PayWithWalletCommand command, CancellationToken ct)
    {
        var success = await _mediator.Send(command, ct);
        return Ok(new { success });
    }
}
