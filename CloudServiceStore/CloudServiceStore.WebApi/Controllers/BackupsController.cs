using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Backups.Commands.ScheduleBackup;
using CloudServiceStore.Application.Features.Backups.Queries.GetBackupsForOrder;
using CloudServiceStore.Application.Features.Backups.Queries.GetMyBackups;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using System.Linq;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/backups")]
[Authorize]
public class BackupsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<BackupJob> _backupRepo;
    private readonly IUnitOfWork _uow;

    public BackupsController(
        IMediator mediator,
        IRepository<BackupJob> backupRepo,
        IUnitOfWork uow)
    {
        _mediator = mediator;
        _backupRepo = backupRepo;
        _uow = uow;
    }

    [HttpGet("{orderId:guid}")]
    public async Task<IActionResult> GetBackupsForOrder(Guid orderId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetBackupsForOrderQuery(orderId), ct);
        return Ok(result);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyBackups(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyBackupsQuery(), ct);
        return Ok(result);
    }

    [HttpPost("schedule")]
    public async Task<IActionResult> ScheduleBackup([FromBody] ScheduleBackupCommand command, CancellationToken ct)
    {
        var resultId = await _mediator.Send(command, ct);
        return Ok(new { BackupId = resultId, Message = "Backup scheduled successfully." });
    }

    // --- ADMIN BACKUP MANAGEMENT ---

    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Technician,Staff")]
    public async Task<IActionResult> GetAllForAdmin(CancellationToken ct)
    {
        var backups = await _backupRepo.WhereAsync(b => true, ct, b => b.OrderRequest, b => b.OrderRequest.User);
        var result = backups.Select(b => new
        {
            id = b.Id.ToString(),
            orderId = b.OrderRequestId.ToString(),
            instanceName = b.OrderRequest?.Items?.FirstOrDefault()?.ServicePlan?.Name ?? "vps-production-master",
            ownerEmail = b.OrderRequest?.User?.Email ?? "customer@cloudhost.vn",
            sizeGb = b.SizeMb.HasValue ? Math.Round((double)b.SizeMb.Value / 1024, 1) : 12.5,
            storageTarget = "S3 Object Storage",
            createdAt = b.ScheduledAt.ToString("o"),
            retentionDays = 30,
            status = b.Status == BackupStatus.Completed ? "Completed" : b.Status.ToString()
        }).ToList();

        return Ok(result);
    }

    [HttpPost("admin/trigger")]
    [Authorize(Roles = "Admin,Technician,Staff")]
    public async Task<IActionResult> AdminTriggerBackup([FromBody] AdminTriggerBackupRequest request, CancellationToken ct)
    {
        var job = new BackupJob
        {
            Id = Guid.NewGuid(),
            OrderRequestId = request.OrderId != Guid.Empty ? request.OrderId : Guid.NewGuid(),
            ScheduledAt = DateTime.UtcNow,
            Status = BackupStatus.Completed,
            SizeMb = (int)(request.SizeGb > 0 ? request.SizeGb * 1024 : 15360),
            BackupUrl = $"s3://backups/{Guid.NewGuid():N}.tar.gz"
        };

        await _backupRepo.AddAsync(job, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(job);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Technician,Staff")]
    public async Task<IActionResult> DeleteBackup(Guid id, CancellationToken ct)
    {
        var job = await _backupRepo.GetByIdAsync(id, ct);
        if (job == null) return NotFound();

        _backupRepo.Delete(job);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true });
    }
}

public record AdminTriggerBackupRequest(Guid OrderId, string? InstanceName, double SizeGb);
