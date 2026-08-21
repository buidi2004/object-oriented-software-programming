using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/app-installer")]
[Route("api/admin/apps")]
[Authorize(Roles = "Admin")]
public class AdminAppInstallerController : ControllerBase
{
    private readonly IRepository<AppInstallation> _repo;
    private readonly IRepository<AppTemplate> _templateRepo;
    private readonly IUnitOfWork _uow;

    public AdminAppInstallerController(
        IRepository<AppInstallation> repo,
        IRepository<AppTemplate> templateRepo,
        IUnitOfWork uow)
    {
        _repo = repo;
        _templateRepo = templateRepo;
        _uow = uow;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var apps = await _repo.WhereAsync(a => true, ct, a => a.User!, a => a.Template!);

        var result = apps.Select(a => new
        {
            id = a.Id,
            templateId = a.TemplateId,
            templateName = a.Template?.Name ?? "App",
            appName = a.Template?.Name ?? "App",
            ownerEmail = a.User?.Email ?? "customer@cloudhost.vn",
            url = a.InstallUrl,
            installUrl = a.InstallUrl,
            containerId = a.ContainerId,
            status = a.Status.ToString(),
            failureReason = a.FailureReason,
            createdAt = a.CreatedAt
        }).OrderByDescending(a => a.createdAt);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteApp(Guid id, CancellationToken ct)
    {
        var app = await _repo.GetByIdAsync(id, ct);
        if (app == null) return NotFound();

        _repo.Delete(app);
        await _uow.SaveChangesAsync(ct);

        return Ok(new { success = true });
    }
}
