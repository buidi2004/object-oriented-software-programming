using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Queries.GetMigrationById;

public record MigrationDetailDto(
    Guid Id,
    Guid UserId,
    Guid OrderRequestId,
    string FromProvider,
    string? Note,
    string Status,
    DateTime CreatedAt);

public record GetMigrationByIdQuery(Guid Id) : IRequest<MigrationDetailDto>;

public class GetMigrationByIdQueryHandler : IRequestHandler<GetMigrationByIdQuery, MigrationDetailDto>
{
    private readonly IRepository<MigrationRequest> _migrationRepo;

    public GetMigrationByIdQueryHandler(IRepository<MigrationRequest> migrationRepo)
    {
        _migrationRepo = migrationRepo;
    }

    public async Task<MigrationDetailDto> Handle(GetMigrationByIdQuery request, CancellationToken ct)
    {
        var migration = await _migrationRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("Yêu cầu migration không tồn tại.");

        return new MigrationDetailDto(
            migration.Id,
            migration.UserId,
            migration.OrderRequestId,
            migration.FromProvider,
            migration.Note,
            migration.Status.ToString(),
            migration.CreatedAt);
    }
}
