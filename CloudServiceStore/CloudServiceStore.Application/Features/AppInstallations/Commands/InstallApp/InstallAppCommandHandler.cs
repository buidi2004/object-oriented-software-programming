using System;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;

public class InstallAppCommandHandler : IRequestHandler<InstallAppCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppInstallation> _repo;
    private readonly IRepository<AppTemplate> _templateRepo;
    private readonly IRepository<HostingAccount> _hostingRepo;
    private readonly ICurrentUserService _currentUser;
    // BUG #4 FIX: Use background queue instead of calling Docker synchronously in the HTTP thread.
    // Pulling large images (e.g., WordPress ~500MB) would cause HTTP timeouts.
    private readonly IResourceProvisioningQueue _taskQueue;

    public InstallAppCommandHandler(
        IUnitOfWork uow,
        IRepository<AppInstallation> repo,
        IRepository<AppTemplate> templateRepo,
        IRepository<HostingAccount> hostingRepo,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _uow = uow;
        _repo = repo;
        _templateRepo = templateRepo;
        _hostingRepo = hostingRepo;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(InstallAppCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // Idempotency check
        var existing = await _repo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        var template = await _templateRepo.GetByIdAsync(request.TemplateId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy ứng dụng");

        var hosting = await _hostingRepo.GetByIdAsync(request.HostingAccountId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy hosting account");

        if (hosting.UserId != userId)
            throw new UnauthorizedException("Bạn không sở hữu hosting này");

        var installation = new AppInstallation
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TemplateId = request.TemplateId,
            HostingAccountId = request.HostingAccountId,
            IdempotencyKey = request.IdempotencyKey
        };

        installation.MarkAsInstalling();

        await _repo.AddAsync(installation, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var installationId = installation.Id;

        // BUG #4 FIX: Queue Docker work to run in background worker — returns immediately to caller.
        // Frontend can poll status or receive SignalR notification when complete.
        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedRepo = serviceProvider.GetRequiredService<IRepository<AppInstallation>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedInstallerService = serviceProvider.GetRequiredService<IAppInstallerService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbInstallation = await scopedRepo.GetByIdAsync(installationId, ct);
            if (dbInstallation == null) return;

            try
            {
                string installUrl = await scopedInstallerService.InstallAppAsync(dbInstallation, ct);

                if (!string.IsNullOrEmpty(installUrl))
                {
                    dbInstallation.MarkAsCompleted(installUrl);
                }
                else
                {
                    dbInstallation.MarkAsFailed("Lỗi tạo container cho App.");
                }
            }
            catch (Exception ex)
            {
                dbInstallation.MarkAsFailed($"Lỗi cấp phát: {ex.Message}");
            }

            await scopedUow.SaveChangesAsync(ct);

            await scopedNotifier.NotifyStatusChangedAsync("AppInstallation", dbInstallation.Id.ToString(), dbInstallation.Status.ToString());
        });

        return installationId;
    }
}
