using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/app-installer")]
[Authorize]
public class AppInstallerController : ControllerBase
{
    private readonly IMediator _mediator;

    public AppInstallerController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("install")]
    public async Task<IActionResult> InstallApp([FromBody] InstallAppCommand command)
    {
        var installationId = await _mediator.Send(command);
        return Ok(new { installationId });
    }
}
