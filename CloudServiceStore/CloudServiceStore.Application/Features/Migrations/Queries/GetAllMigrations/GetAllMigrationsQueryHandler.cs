using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Queries.GetAllMigrations;

public class GetAllMigrationsQueryHandler : IRequestHandler<GetAllMigrationsQuery, IEnumerable<MigrationRequest>>
{
    private readonly IRepository<MigrationRequest> _migrationRepo;

    public GetAllMigrationsQueryHandler(IRepository<MigrationRequest> migrationRepo)
    {
        _migrationRepo = migrationRepo;
    }

    public async Task<IEnumerable<MigrationRequest>> Handle(GetAllMigrationsQuery request, CancellationToken cancellationToken)
    {
        return await _migrationRepo.GetAllAsync(cancellationToken);
    }
}
