using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Migrations.Commands.UpdateMigrationStatus;

public class UpdateMigrationStatusCommandHandler : IRequestHandler<UpdateMigrationStatusCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<MigrationRequest> _migrationRepo;

    public UpdateMigrationStatusCommandHandler(IUnitOfWork uow, IRepository<MigrationRequest> migrationRepo)
    { _uow = uow; _migrationRepo = migrationRepo; }

    public async Task<bool> Handle(UpdateMigrationStatusCommand request, CancellationToken cancellationToken)
    {
        var migration = await _migrationRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Yêu cầu di chuyển dữ liệu không tồn tại.");
            
        migration.Status = request.Status;
        _migrationRepo.Update(migration);
        await _uow.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
