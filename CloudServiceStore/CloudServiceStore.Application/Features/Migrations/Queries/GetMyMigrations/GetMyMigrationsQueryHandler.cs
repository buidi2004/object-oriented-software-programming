using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Queries.GetMyMigrations;

public class GetMyMigrationsQueryHandler : IRequestHandler<GetMyMigrationsQuery, IEnumerable<MigrationRequest>>
{
    private readonly IRepository<MigrationRequest> _migrationRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyMigrationsQueryHandler(IRepository<MigrationRequest> migrationRepo, ICurrentUserService currentUser)
    { _migrationRepo = migrationRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<MigrationRequest>> Handle(GetMyMigrationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        return await _migrationRepo.WhereAsync(m => m.UserId == userId, cancellationToken);
    }
}
