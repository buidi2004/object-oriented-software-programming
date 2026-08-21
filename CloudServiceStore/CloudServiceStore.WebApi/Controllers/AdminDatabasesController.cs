using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ManagedDatabases.Queries.GetAdminDatabases;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.WebApi.Controllers;

public record MarkFailedRequest(string? Reason);

[ApiController]
[Route("api/admin/databases")]
[Authorize(Roles = "Admin")]
public class AdminDatabasesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<ManagedDatabaseInstance> _repo;
    private readonly IUnitOfWork _uow;
    private readonly IResourceProvisioningQueue _taskQueue;

    public AdminDatabasesController(
        IMediator mediator,
        IRepository<ManagedDatabaseInstance> repo,
        IUnitOfWork uow,
        IResourceProvisioningQueue taskQueue)
    {
        _mediator = mediator;
        _repo = repo;
        _uow = uow;
        _taskQueue = taskQueue;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDatabases(CancellationToken ct)
    {
        var databases = await _mediator.Send(new GetAdminDatabasesQuery(), ct);
        return Ok(databases);
    }

    [HttpPost("{id:guid}/retry")]
    public async Task<IActionResult> RetryProvisioning(Guid id, CancellationToken cancellationToken)
    {
        var instance = await _repo.GetByIdAsync(id, cancellationToken);
        if (instance == null) return NotFound("Không tìm thấy database instance.");

        instance.MarkAsProvisioning();
        await _uow.SaveChangesAsync(cancellationToken);

        var instanceId = instance.Id;
        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedRepo = serviceProvider.GetRequiredService<IRepository<ManagedDatabaseInstance>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IDatabaseProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbInstance = await scopedRepo.GetByIdAsync(instanceId, ct);
            if (dbInstance == null) return;

            try
            {
                int assignedPort = await scopedProvService.ProvisionDatabaseAsync(dbInstance, ct);
                if (assignedPort > 0)
                {
                    dbInstance.MarkAsRunning(assignedPort);
                }
                else
                {
                    dbInstance.MarkAsFailed("Lỗi khi cấp phát Database qua Docker (Admin Retry).");
                }
            }
            catch (Exception ex)
            {
                dbInstance.MarkAsFailed($"Lỗi cấp phát: {ex.Message}");
            }

            await scopedUow.SaveChangesAsync(ct);
            await scopedNotifier.NotifyStatusChangedAsync("ManagedDatabaseInstance", dbInstance.Id.ToString(), dbInstance.Status.ToString());
        });

        return Ok(new { success = true, message = "Đã gửi yêu cầu Force Retry cấp phát database." });
    }

    [HttpPost("{id:guid}/mark-failed")]
    public async Task<IActionResult> MarkFailed(Guid id, [FromBody] MarkFailedRequest request, CancellationToken cancellationToken)
    {
        var instance = await _repo.GetByIdAsync(id, cancellationToken);
        if (instance == null) return NotFound("Không tìm thấy database instance.");

        instance.MarkAsFailed(request?.Reason ?? "Quản trị viên đánh dấu Failed thủ công.");
        await _uow.SaveChangesAsync(cancellationToken);

        return Ok(new { success = true, message = "Đã cập nhật trạng thái Failed." });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteDatabase(Guid id, CancellationToken cancellationToken)
    {
        var instance = await _repo.GetByIdAsync(id, cancellationToken);
        if (instance == null) return NotFound();

        _repo.Delete(instance);
        await _uow.SaveChangesAsync(cancellationToken);

        return Ok(new { success = true });
    }
}
