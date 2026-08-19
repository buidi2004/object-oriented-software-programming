using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;

public class CreateStaticSiteCommandHandler : IRequestHandler<CreateStaticSiteCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<StaticSite> _repo;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public CreateStaticSiteCommandHandler(
        IUnitOfWork uow,
        IRepository<StaticSite> repo,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(CreateStaticSiteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // 1. Idempotency Check
        var existing = await _repo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        // 2. Tạo Entity (State: Pending -> Provisioning)
        var staticSite = new StaticSite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            IdempotencyKey = request.IdempotencyKey
        };

        staticSite.MarkAsProvisioning();

        await _repo.AddAsync(staticSite, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var staticSiteId = staticSite.Id;

        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            await Task.Delay(5000, ct);

            var scopedRepo = serviceProvider.GetRequiredService<IRepository<StaticSite>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IStaticSiteProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbSite = await scopedRepo.GetByIdAsync(staticSiteId, ct);
            if (dbSite == null) return;

            bool success = await scopedProvService.ProvisionProjectAsync(dbSite, ct);

            if (success)
            {
                dbSite.MarkAsActive();
            }
            else
            {
                dbSite.MarkAsFailed("Lỗi tạo Project trên CI/CD.");
            }

            await scopedUow.SaveChangesAsync(ct);

            await scopedNotifier.NotifyStatusChangedAsync("StaticSiteProject", dbSite.Id.ToString(), dbSite.Status.ToString());
        });

        return staticSiteId;
    }
}
