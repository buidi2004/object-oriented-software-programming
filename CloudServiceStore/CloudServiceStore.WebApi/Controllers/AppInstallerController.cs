using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;
using CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;
using CloudServiceStore.Application.Features.AppInstallations.Queries.GetAllAppInstallations;
using CloudServiceStore.Application.Features.AppInstallations.Queries.GetMyAppInstallations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/app-installer")]
public class AppInstallerController : ControllerBase
{
    private readonly IMediator _mediator;

    public AppInstallerController(IMediator mediator) => _mediator = mediator;

    [HttpPost("install")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> InstallApp([FromBody] InstallAppCommand command, CancellationToken ct)
    {
        var installationId = await _mediator.Send(command, ct);
        return Ok(new { installationId });
    }

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyAppInstallations(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyAppInstallationsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> GetAllAppInstallationsForAdmin(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllAppInstallationsQuery(), ct);
        return Ok(result);
    }
}
