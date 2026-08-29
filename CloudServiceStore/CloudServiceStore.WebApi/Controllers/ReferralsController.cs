using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Referrals.Commands.ApplyReferralCode;
using CloudServiceStore.Application.Features.Referrals.Queries.GetMyReferral;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/referrals")]
[Authorize]
public class ReferralsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ReferralsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyReferral(CancellationToken ct)
    {
        var referral = await _mediator.Send(new GetMyReferralQuery(), ct);
        return Ok(referral);
    }

    [HttpPost("apply")]
    public async Task<IActionResult> Apply([FromBody] ApplyReferralCodeCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
