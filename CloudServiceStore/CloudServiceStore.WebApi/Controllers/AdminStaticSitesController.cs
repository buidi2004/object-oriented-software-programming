using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.StaticSites.Commands.DeployStaticSite;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/static-sites")]
[Authorize(Roles = "Admin")]
public class AdminStaticSitesController : ControllerBase
{
    private readonly IRepository<StaticSite> _repo;
    private readonly IUnitOfWork _uow;
    private readonly IMediator _mediator;

    public AdminStaticSitesController(
        IRepository<StaticSite> repo,
        IUnitOfWork uow,
        IMediator mediator)
    {
        _repo = repo;
        _uow = uow;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var sites = await _repo.WhereAsync(s => true, ct, s => s.User!);

        var result = sites.Select(s => new
        {
            id = s.Id,
            name = s.Name,
            ownerEmail = s.User?.Email ?? "customer@cloudhost.vn",
            customDomain = s.CustomDomain,
            deployUrl = s.DeployUrl,
            status = s.Status.ToString(),
            failureReason = s.FailureReason,
            createdAt = s.CreatedAt
        }).OrderByDescending(s => s.createdAt);

        return Ok(result);
    }

    [HttpPost("{id:guid}/deploy")]
    [HttpPost("{id:guid}/redeploy")]
    public async Task<IActionResult> Redeploy(Guid id, [FromBody] DeployStaticSiteCommand? command, CancellationToken ct)
    {
        var cmd = command != null ? command with { SiteId = id } : new DeployStaticSiteCommand(id, $"admin-redeploy-{DateTime.UtcNow:yyyyMMdd-HHmmss}");
        var deployId = await _mediator.Send(cmd, ct);
        return Ok(new { success = true, deployId });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSite(Guid id, CancellationToken ct)
    {
        var site = await _repo.GetByIdAsync(id, ct);
        if (site == null) return NotFound();

        _repo.Delete(site);
        await _uow.SaveChangesAsync(ct);

        return Ok(new { success = true });
    }
}
