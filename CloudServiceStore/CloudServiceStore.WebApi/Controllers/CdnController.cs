using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Cdn.Commands.CreateCdn;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/cdn")]
[Authorize]
public class CdnController : ControllerBase
{
    private readonly IMediator _mediator;

    public CdnController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCdn([FromBody] CreateCdnCommand command)
    {
        var distributionId = await _mediator.Send(command);
        return Ok(new { distributionId });
    }
}
