using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;

public class CreateBucketCommandHandler : IRequestHandler<CreateBucketCommand, Guid>
{
    private readonly IRepository<ObjectStorageBucket> _bucketRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IResourceProvisioningQueue _taskQueue;

    public CreateBucketCommandHandler(
        IRepository<ObjectStorageBucket> bucketRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUser,
        IResourceProvisioningQueue taskQueue)
    {
        _bucketRepo = bucketRepo;
        _uow = uow;
        _currentUser = currentUser;
        _taskQueue = taskQueue;
    }

    public async Task<Guid> Handle(CreateBucketCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // Idempotency check
        var existing = await _bucketRepo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        // Tạm gán 5GB mặc định
        var bucket = new ObjectStorageBucket
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BucketName = request.BucketName,
            Region = request.Region,
            CapacityGB = 5,
            IdempotencyKey = request.IdempotencyKey
        };

        // Bắt đầu State Machine
        bucket.MarkAsProvisioning();

        await _bucketRepo.AddAsync(bucket, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var bucketId = bucket.Id;

        // Enqueue Provisioning Task
        await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, ct) =>
        {
            await Task.Delay(5000, ct); // Simulate real-world provisioning delay

            var scopedRepo = serviceProvider.GetRequiredService<IRepository<ObjectStorageBucket>>();
            var scopedUow = serviceProvider.GetRequiredService<IUnitOfWork>();
            var scopedProvService = serviceProvider.GetRequiredService<IMinioProvisioningService>();
            var scopedNotifier = serviceProvider.GetRequiredService<IResourceStatusNotifier>();

            var dbBucket = await scopedRepo.GetByIdAsync(bucketId, ct);
            if (dbBucket == null) return;

            var minioResult = await scopedProvService.CreateBucketAsync(dbBucket.BucketName, dbBucket.Region, ct);

            if (minioResult)
            {
                dbBucket.MarkAsActive();
            }
            else
            {
                dbBucket.MarkAsFailed("Failed to create bucket via MinIO API.");
            }

            await scopedUow.SaveChangesAsync(ct);

            // Notify Frontend via SignalR
            await scopedNotifier.NotifyStatusChangedAsync("ObjectStorageBucket", dbBucket.Id.ToString(), dbBucket.Status.ToString());
        });

        return bucketId;
    }
}
