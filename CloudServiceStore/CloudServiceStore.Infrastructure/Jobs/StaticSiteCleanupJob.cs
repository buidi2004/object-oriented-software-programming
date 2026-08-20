using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Jobs;

public class StaticSiteCleanupJob
{
    private readonly IRepository<StaticSite> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<StaticSiteCleanupJob> _logger;

    public StaticSiteCleanupJob(
        IRepository<StaticSite> repo,
        IUnitOfWork uow,
        ILogger<StaticSiteCleanupJob> logger)
    {
        _repo = repo;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job dọn dẹp Static Site bị kẹt...");

        var allSites = await _repo.GetAllAsync(cancellationToken);
        
        var stuckTime = DateTime.UtcNow.AddMinutes(-15);

        var stuckSites = allSites.Where(x => 
            x.Status == StaticSiteStatus.Provisioning && 
            x.CreatedAt <= stuckTime).ToList();

        if (!stuckSites.Any())
        {
            _logger.LogInformation("Không có Static Site nào bị kẹt.");
            return;
        }

        foreach (var site in stuckSites)
        {
            _logger.LogWarning($"Static Site {site.Id} kẹt ở Provisioning quá 15 phút. Đánh dấu Failed.");
            site.MarkAsFailed("Provisioning timeout by Cleanup Job.");
        }

        await _uow.SaveChangesAsync(cancellationToken);
    }
}
