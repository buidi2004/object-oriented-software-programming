using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;
using CloudServiceStore.Application.Features.StaticSites.Commands.DeployStaticSite;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/static-sites")]
public class StaticSitesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<StaticSite> _repo;
    private readonly ICurrentUserService _currentUser;

    public StaticSitesController(
        IMediator mediator,
        IRepository<StaticSite> repo,
        ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _repo = repo;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetMySites(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var sites = userId.HasValue
            ? await _repo.WhereAsync(s => s.UserId == userId.Value, ct)
            : await _repo.GetAllAsync(ct);

        var result = sites.Select(s => new
        {
            id = s.Id,
            name = s.Name,
            customDomain = s.CustomDomain,
            deployUrl = s.DeployUrl,
            status = s.Status.ToString(),
            failureReason = s.FailureReason,
            createdAt = s.CreatedAt
        }).OrderByDescending(s => s.createdAt);

        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateSite(
        [FromBody] CreateStaticSiteCommand command,
        CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPost("{id:guid}/deploy")]
    [Authorize]
    public async Task<IActionResult> Deploy(
        Guid id,
        [FromBody] DeployStaticSiteCommand command,
        CancellationToken ct)
    {
        var deployId = await _mediator.Send(command with { SiteId = id }, ct);
        return Ok(new { deployId });
    }
}
