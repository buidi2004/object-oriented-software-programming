using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Security.Queries.GetAllSecuritySubscriptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/security")]
[Authorize(Roles = "Admin")]
public class AdminSecurityController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminSecurityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSubscriptions(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllSecuritySubscriptionsQuery(), cancellationToken);
        return Ok(result);
    }
}
