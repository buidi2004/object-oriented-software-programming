using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ManagedDatabases.Queries.GetAdminDatabases;

public class GetAdminDatabasesQueryHandler : IRequestHandler<GetAdminDatabasesQuery, List<AdminDatabaseDto>>
{
    private readonly IRepository<ManagedDatabaseInstance> _repository;

    public GetAdminDatabasesQueryHandler(IRepository<ManagedDatabaseInstance> repository)
    {
        _repository = repository;
    }

    public async Task<List<AdminDatabaseDto>> Handle(GetAdminDatabasesQuery request, CancellationToken cancellationToken)
    {
        // Notice we must include User to get OwnerEmail
        var databases = await _repository.WhereAsync(x => true, cancellationToken, d => d.User!);

        return databases.Select(d => new AdminDatabaseDto
        {
            Id = d.Id,
            UserId = d.UserId,
            OwnerEmail = d.User?.Email ?? "Unknown",
            Name = d.Name,
            Engine = d.Engine.ToString(),
            Version = d.Version,
            Port = d.Port,
            Status = d.Status.ToString(),
            FailureReason = d.FailureReason,
            CreatedAt = d.CreatedAt
        }).OrderByDescending(d => d.CreatedAt).ToList();
    }
}
