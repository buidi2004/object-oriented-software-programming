using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Jobs;

public class ManagedDatabaseCleanupJob
{
    private readonly IRepository<ManagedDatabaseInstance> _dbRepo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<ManagedDatabaseCleanupJob> _logger;

    public ManagedDatabaseCleanupJob(
        IRepository<ManagedDatabaseInstance> dbRepo,
        IUnitOfWork uow,
        ILogger<ManagedDatabaseCleanupJob> logger)
    {
        _dbRepo = dbRepo;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job dọn dẹp các Database bị kẹt ở trạng thái Provisioning...");

        var allDbs = await _dbRepo.GetAllAsync(cancellationToken);
        
        // Quá 15 phút chưa xong là kẹt
        var stuckTime = DateTime.UtcNow.AddMinutes(-15);

        var stuckDbs = allDbs.Where(x => 
            x.Status == ManagedDatabaseStatus.Provisioning && 
            x.CreatedAt <= stuckTime).ToList();

        if (!stuckDbs.Any())
        {
            _logger.LogInformation("Không có Database nào bị kẹt.");
            return;
        }

        foreach (var db in stuckDbs)
        {
            _logger.LogWarning($"Database {db.Name} (Id: {db.Id}) bị kẹt ở Provisioning quá thời gian. Chuyển sang Failed.");
            
            // Note: Đáng ra ở đây có thể gọi Docker API để force rm container (nếu có)
            // nhưng do dùng Mock nên ta chỉ cần đánh dấu trạng thái Failed.
            db.MarkAsFailed("Provisioning timeout by Cleanup Job.");
        }

        await _uow.SaveChangesAsync(cancellationToken);
        _logger.LogInformation($"Hoàn tất dọn dẹp {stuckDbs.Count} database bị kẹt.");
    }
}
