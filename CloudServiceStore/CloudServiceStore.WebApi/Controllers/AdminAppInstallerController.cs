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

    [HttpPost]
    public async Task<IActionResult> CreateApp([FromBody] AdminCreateAppRequest request, CancellationToken ct)
    {
        var templates = await _templateRepo.GetAllAsync(ct);
        var templateId = request.TemplateId != Guid.Empty ? request.TemplateId : (templates.FirstOrDefault()?.Id ?? Guid.NewGuid());

        var host = HttpContext.Request.Host.Host;
        if (string.IsNullOrWhiteSpace(host) || host == "0.0.0.0") host = "127.0.0.1";

        var app = new AppInstallation
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId != Guid.Empty ? request.UserId : Guid.NewGuid(),
            TemplateId = templateId,
            HostingAccountId = Guid.NewGuid(),
            InstallUrl = $"http://app-{Guid.NewGuid():N}.{host}:8080".Substring(0, 35),
            CreatedAt = DateTime.UtcNow
        };
        app.MarkAsInstalling();
        app.MarkAsCompleted(app.InstallUrl);

        await _repo.AddAsync(app, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(app);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateApp(Guid id, [FromBody] AdminUpdateAppRequest request, CancellationToken ct)
    {
        var app = await _repo.GetByIdAsync(id, ct);
        if (app == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.InstallUrl)) app.InstallUrl = request.InstallUrl;

        _repo.Update(app);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true, app });
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

public record AdminCreateAppRequest(Guid UserId, Guid TemplateId, string? AppName);
public record AdminUpdateAppRequest(string? InstallUrl, string? Status);
