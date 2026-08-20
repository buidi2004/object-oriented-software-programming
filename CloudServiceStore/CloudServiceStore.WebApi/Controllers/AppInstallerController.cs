using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
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
    private readonly IRepository<AppInstallation> _repo;
    private readonly ICurrentUserService _currentUser;

    public AppInstallerController(
        IMediator mediator,
        IRepository<AppInstallation> repo,
        ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _repo = repo;
        _currentUser = currentUser;
    }

    [HttpPost("install")]
    public async Task<IActionResult> InstallApp([FromBody] InstallAppCommand command)
    {
        var installationId = await _mediator.Send(command);
        return Ok(new { installationId });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyAppInstallations(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var apps = userId.HasValue
            ? await _repo.WhereAsync(a => a.UserId == userId.Value, ct)
            : await _repo.GetAllAsync(ct);

        var result = apps.Select(a => new
        {
            id = a.Id,
            templateId = a.TemplateId,
            installUrl = a.InstallUrl,
            status = a.Status.ToString(),
            failureReason = a.FailureReason,
            createdAt = a.CreatedAt
        }).OrderByDescending(a => a.createdAt);

        return Ok(result);
    }
}
