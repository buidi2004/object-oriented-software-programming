using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;
using CloudServiceStore.Application.Features.GiftCards.Queries.GetGiftCardBalance;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/gift-cards")]
public class GiftCardsController : ControllerBase
{
    private readonly IMediator _mediator;
    public GiftCardsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{code}/balance")]
    public async Task<IActionResult> GetBalance(string code, CancellationToken ct)
    {
        var balance = await _mediator.Send(new GetGiftCardBalanceQuery { Code = code }, ct);
        return Ok(balance);
    }

    [HttpPost("redeem")]
    [Authorize]
    public async Task<IActionResult> Redeem([FromBody] RedeemGiftCardCommand command, CancellationToken ct)
    {
        var remaining = await _mediator.Send(command, ct);
        return Ok(new { remainingAmount = remaining });
    }
}
