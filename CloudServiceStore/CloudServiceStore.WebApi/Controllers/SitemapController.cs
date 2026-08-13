using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.SEO.Queries.GetSitemap;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
public class SitemapController : ControllerBase
{
    private readonly IMediator _mediator;
    public SitemapController(IMediator mediator) => _mediator = mediator;

    [HttpGet("sitemap.xml")]
    public async Task<IActionResult> GetSitemap(CancellationToken ct)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var xml = await _mediator.Send(new GetSitemapQuery(baseUrl), ct);
        return Content(xml, "application/xml");
    }
}
