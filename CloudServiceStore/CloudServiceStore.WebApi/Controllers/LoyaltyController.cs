using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Loyalty.Commands.RedeemLoyalty;
using CloudServiceStore.Application.Features.Loyalty.Queries.GetMyLoyalty;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/loyalty")]
[Authorize(Roles = "Customer")]
public class LoyaltyController : ControllerBase
{
    private readonly IMediator _mediator;
    public LoyaltyController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    public async Task<IActionResult> GetMyLoyalty(CancellationToken ct)
    {
        var loyalty = await _mediator.Send(new GetMyLoyaltyQuery(), ct);
        return Ok(loyalty);
    }

    [HttpPost("redeem")]
    public async Task<IActionResult> Redeem([FromBody] RedeemLoyaltyCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
