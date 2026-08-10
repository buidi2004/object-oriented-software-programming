using CloudServiceStore.Application.Features.RecentlyViewed.Commands.AddRecentlyViewed;
using CloudServiceStore.Application.Features.RecentlyViewed.Queries.GetMyRecentlyViewed;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/recently-viewed")]
[Authorize(Roles = "Customer")]
public class RecentlyViewedController : ControllerBase
{
    private readonly IMediator _mediator;

    public RecentlyViewedController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyRecentlyViewed(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyRecentlyViewedQuery(), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddRecentlyViewed([FromBody] AddRecentlyViewedCommand command, CancellationToken ct)
    {
        var success = await _mediator.Send(command, ct);
        return success ? Ok() : BadRequest();
    }
}
