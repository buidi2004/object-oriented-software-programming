using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Jobs;

public class ObjectStorageCleanupJob
{
    private readonly IRepository<ObjectStorageBucket> _bucketRepo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<ObjectStorageCleanupJob> _logger;

    public ObjectStorageCleanupJob(
        IRepository<ObjectStorageBucket> bucketRepo,
        IUnitOfWork uow,
        ILogger<ObjectStorageCleanupJob> logger)
    {
        _bucketRepo = bucketRepo;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job dọn dẹp các Bucket bị kẹt ở trạng thái Provisioning...");

        var allBuckets = await _bucketRepo.GetAllAsync(cancellationToken);
        
        // Quá 10 phút chưa xong là kẹt
        var stuckTime = DateTime.UtcNow.AddMinutes(-10);

        var stuckBuckets = allBuckets.Where(x => 
            x.Status == ObjectStorageStatus.Provisioning && 
            x.CreatedAt <= stuckTime).ToList();

        if (!stuckBuckets.Any())
        {
            _logger.LogInformation("Không có Bucket nào bị kẹt.");
            return;
        }

        foreach (var bucket in stuckBuckets)
        {
            _logger.LogWarning($"Bucket {bucket.BucketName} (Id: {bucket.Id}) bị kẹt ở Provisioning quá thời gian. Chuyển sang trạng thái Failed.");
            
            // Note: Đáng ra ở đây có thể gọi MinIO để xóa bucket rác (nếu nó được tạo dở dang), 
            // nhưng do dùng Mock nên ta chỉ cần đánh dấu trạng thái Failed.
            bucket.MarkAsFailed("Provisioning timeout by Cleanup Job.");
        }

        await _uow.SaveChangesAsync(cancellationToken);
        _logger.LogInformation($"Hoàn tất dọn dẹp {stuckBuckets.Count} buckets bị kẹt.");
    }
}
