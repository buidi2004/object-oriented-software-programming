using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Jobs;

public class AppInstallationCleanupJob
{
    private readonly IRepository<AppInstallation> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<AppInstallationCleanupJob> _logger;

    public AppInstallationCleanupJob(
        IRepository<AppInstallation> repo,
        IUnitOfWork uow,
        ILogger<AppInstallationCleanupJob> logger)
    {
        _repo = repo;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job dọn dẹp App Installation bị kẹt...");

        var allInstallations = await _repo.GetAllAsync(cancellationToken);
        
        var stuckTime = DateTime.UtcNow.AddMinutes(-20);

        var stuckInstallations = allInstallations.Where(x => 
            x.Status == AppInstallationStatus.Installing && 
            x.CreatedAt <= stuckTime).ToList();

        if (!stuckInstallations.Any())
        {
            _logger.LogInformation("Không có App Installation nào bị kẹt.");
            return;
        }

        foreach (var installation in stuckInstallations)
        {
            _logger.LogWarning($"App Installation {installation.Id} kẹt ở Installing quá 20 phút. Đánh dấu Failed.");
            installation.MarkAsFailed("Installation timeout by Cleanup Job.");
        }

        await _uow.SaveChangesAsync(cancellationToken);
    }
}
