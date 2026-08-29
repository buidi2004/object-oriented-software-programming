using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AuditLogs.Queries.GetAuditLogs;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, IReadOnlyList<AuditLogDto>>
{
    private readonly IRepository<AuditLog> _repo;
    private readonly IRepository<AppUser> _userRepo;

    public GetAuditLogsQueryHandler(IRepository<AuditLog> repo, IRepository<AppUser> userRepo)
    {
        _repo = repo;
        _userRepo = userRepo;
    }

    public async Task<IReadOnlyList<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        var logs = await _repo.GetAllAsync(ct);
        var users = await _userRepo.GetAllAsync(ct);
        var userDict = users.ToDictionary(u => u.Id, u => u.Email);

        return logs
            .OrderByDescending(l => l.Timestamp)
            .Select(l => new AuditLogDto(
                l.Id, 
                l.UserId, 
                l.UserId.HasValue && userDict.ContainsKey(l.UserId.Value) ? userDict[l.UserId.Value] : null,
                l.Action.ToString(), 
                l.EntityName, 
                l.EntityId, 
                l.IpAddress, 
                l.Timestamp,
                l.Details
            )).ToList().AsReadOnly();
    }
}
