using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Jobs;

public class CdnProvisioningCleanupJob
{
    private readonly IRepository<CdnDistribution> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<CdnProvisioningCleanupJob> _logger;

    public CdnProvisioningCleanupJob(
        IRepository<CdnDistribution> repo,
        IUnitOfWork uow,
        ILogger<CdnProvisioningCleanupJob> logger)
    {
        _repo = repo;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job dọn dẹp Cdn Distribution bị kẹt...");

        var allDistributions = await _repo.GetAllAsync(cancellationToken);
        
        var stuckTime = DateTime.UtcNow.AddMinutes(-15);

        var stuckDistributions = allDistributions.Where(x => 
            x.Status == CdnStatus.Provisioning && 
            x.CreatedAt <= stuckTime).ToList();

        if (!stuckDistributions.Any())
        {
            _logger.LogInformation("Không có Cdn Distribution nào bị kẹt.");
            return;
        }

        foreach (var distribution in stuckDistributions)
        {
            _logger.LogWarning($"Cdn Distribution {distribution.Id} kẹt ở Provisioning quá 15 phút. Đánh dấu Failed.");
            distribution.MarkAsFailed("Provisioning timeout by Cleanup Job.");
        }

        await _uow.SaveChangesAsync(cancellationToken);
    }
}
