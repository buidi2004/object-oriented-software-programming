using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.RecentlyViewed.Commands.RecordView;
using CloudServiceStore.Application.Features.RecentlyViewed.Queries.GetMyRecentlyViewed;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/recently-viewed")]
[Authorize]
public class RecentlyViewedController : ControllerBase
{
    private readonly IMediator _mediator;
    public RecentlyViewedController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> RecordView([FromBody] RecordViewCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyHistory(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyRecentlyViewedQuery(), ct);
        return Ok(result);
    }
}
