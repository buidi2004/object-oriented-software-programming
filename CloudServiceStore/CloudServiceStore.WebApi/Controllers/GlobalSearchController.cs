using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.GlobalSearch.Queries.SearchAll;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/search")]
public class GlobalSearchController : ControllerBase
{
    private readonly IMediator _mediator;
    public GlobalSearchController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q)) return BadRequest("Keyword is required");
        
        var result = await _mediator.Send(new SearchAllQuery(q), ct);
        return Ok(result);
    }
}
