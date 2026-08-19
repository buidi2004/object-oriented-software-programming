using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Jobs;

public class GameServerCleanupJob
{
    private readonly IRepository<GameServerInstance> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<GameServerCleanupJob> _logger;

    public GameServerCleanupJob(
        IRepository<GameServerInstance> repo,
        IUnitOfWork uow,
        ILogger<GameServerCleanupJob> logger)
    {
        _repo = repo;
        _uow = uow;
        _logger = logger;
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Bắt đầu Job dọn dẹp Game Server bị kẹt...");

        var allServers = await _repo.GetAllAsync(cancellationToken);
        
        // Timeout cho game server là 20 phút (vì pull image nặng)
        var stuckTime = DateTime.UtcNow.AddMinutes(-20);

        var stuckServers = allServers.Where(x => 
            x.Status == GameServerStatus.Provisioning && 
            x.CreatedAt <= stuckTime).ToList();

        if (!stuckServers.Any())
        {
            _logger.LogInformation("Không có Game Server nào bị kẹt.");
            return;
        }

        foreach (var server in stuckServers)
        {
            _logger.LogWarning($"Game Server {server.ServerName} (Id: {server.Id}) kẹt ở Provisioning quá 20 phút. Đánh dấu Failed.");
            server.MarkAsFailed("Provisioning timeout by Cleanup Job.");
        }

        await _uow.SaveChangesAsync(cancellationToken);
    }
}
