using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;
using CloudServiceStore.Application.Features.StaticSites.Commands.DeployStaticSite;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/static-sites")]
public class StaticSitesController : ControllerBase
{
    private readonly IMediator _mediator;

    public StaticSitesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMySites(CancellationToken ct)
    {
        // Return empty list for now - get my sites will be implemented via query
        return Ok(new System.Collections.Generic.List<object>());
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateSite(
        [FromBody] CreateStaticSiteCommand command,
        CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPost("{id:guid}/deploy")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Deploy(
        Guid id,
        [FromBody] DeployStaticSiteCommand command,
        CancellationToken ct)
    {
        var deployId = await _mediator.Send(command with { SiteId = id }, ct);
        return Ok(new { deployId });
    }
}
