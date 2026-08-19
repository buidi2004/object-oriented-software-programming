using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;

public class CreateBucketCommandHandler : IRequestHandler<CreateBucketCommand, Guid>
{
    private readonly IRepository<ObjectStorageBucket> _bucketRepo;
    private readonly IMinioProvisioningService _minioService;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public CreateBucketCommandHandler(
        IRepository<ObjectStorageBucket> bucketRepo,
        IMinioProvisioningService minioService,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _bucketRepo = bucketRepo;
        _minioService = minioService;
        _uow = uow;
        _currentUser = currentUser;
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

        // Gọi MinIO
        var minioResult = await _minioService.CreateBucketAsync(bucket.BucketName, bucket.Region, cancellationToken);

        if (minioResult)
        {
            bucket.MarkAsActive();
        }
        else
        {
            bucket.MarkAsFailed("Failed to create bucket via MinIO API.");
        }

        await _uow.SaveChangesAsync(cancellationToken);

        return bucket.Id;
    }
}
