using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Backups.Queries.GetMyBackups;

public class BackupDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Size { get; set; } // in GB or MB
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = "manual";
}

public record GetMyBackupsQuery() : IRequest<List<BackupDto>>;

public class GetMyBackupsQueryHandler : IRequestHandler<GetMyBackupsQuery, List<BackupDto>>
{
    private readonly IRepository<BackupJob> _backupRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyBackupsQueryHandler(
        IRepository<BackupJob> backupRepository,
        IRepository<OrderRequest> orderRepository,
        ICurrentUserService currentUserService)
    {
        _backupRepository = backupRepository;
        _orderRepository = orderRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<BackupDto>> Handle(GetMyBackupsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        
        var myOrders = await _orderRepository.WhereAsync(o => o.UserId == userId, cancellationToken);
        var myOrderIds = myOrders.Select(o => o.Id).ToList();
        
        var backups = await _backupRepository.WhereAsync(b => myOrderIds.Contains(b.OrderRequestId), cancellationToken);

        return backups.Select(b => new BackupDto
        {
            Id = b.Id,
            OrderId = b.OrderRequestId,
            Name = "Backup - " + b.ScheduledAt.ToString("yyyy-MM-dd"),
            Size = b.SizeMb.HasValue ? Math.Round(b.SizeMb.Value / 1024m, 2) : 0, // convert MB to GB
            CreatedAt = b.ScheduledAt,
            Status = b.Status.ToString().ToLower(),
            Type = "manual" // Default mapping
        }).OrderByDescending(x => x.CreatedAt).ToList();
    }
}
