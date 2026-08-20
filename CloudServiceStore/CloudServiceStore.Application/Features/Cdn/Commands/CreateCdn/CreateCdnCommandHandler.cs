using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.Cdn.Commands.CreateCdn;

public class CreateCdnCommandHandler : IRequestHandler<CreateCdnCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<CloudServiceStore.Domain.Entities.CdnDistribution> _repo;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public CreateCdnCommandHandler(
        IUnitOfWork uow,
        IRepository<CloudServiceStore.Domain.Entities.CdnDistribution> repo,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(CreateCdnCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // 1. Idempotency Check
        var existing = await _repo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        // 2. Tạo Entity (State: Pending -> Provisioning)
        var distribution = new CloudServiceStore.Domain.Entities.CdnDistribution
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OriginUrl = request.OriginUrl,
            IdempotencyKey = request.IdempotencyKey
        };

        distribution.MarkAsProvisioning();

        await _repo.AddAsync(distribution, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var distributionId = distribution.Id;

        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            var scopedRepo = serviceProvider.GetRequiredService<IRepository<CloudServiceStore.Domain.Entities.CdnDistribution>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<ICdnProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbDistribution = await scopedRepo.GetByIdAsync(distributionId, ct);
            if (dbDistribution == null) return;

            try
            {
                string cname = await scopedProvService.CreateDistributionAsync(dbDistribution, ct);

                if (!string.IsNullOrEmpty(cname))
                {
                    dbDistribution.MarkAsActive(cname);
                }
                else
                {
                    dbDistribution.MarkAsFailed("Lỗi tạo Zone trên CDN.");
                }
            }
            catch (Exception ex)
            {
                dbDistribution.MarkAsFailed($"Lỗi cấp phát CDN: {ex.Message}");
            }

            await scopedUow.SaveChangesAsync(ct);

            await scopedNotifier.NotifyStatusChangedAsync("CdnDistribution", dbDistribution.Id.ToString(), dbDistribution.Status.ToString());
        });

        return distributionId;
    }
}
