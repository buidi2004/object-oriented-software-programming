using CloudServiceStore.Application.Features.SEO.Queries.GenerateSitemap;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("")]
public class SitemapController : ControllerBase
{
    private readonly IMediator _mediator;

    public SitemapController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("sitemap.xml")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSitemap(CancellationToken ct)
    {
        var xml = await _mediator.Send(new GenerateSitemapQuery(), ct);
        return Content(xml, "application/xml", Encoding.UTF8);
    }
}
