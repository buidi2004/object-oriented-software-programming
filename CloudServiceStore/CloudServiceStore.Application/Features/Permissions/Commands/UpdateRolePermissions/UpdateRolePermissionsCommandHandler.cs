using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Permissions.Commands.UpdateRolePermissions;

public class UpdateRolePermissionsCommandHandler : IRequestHandler<UpdateRolePermissionsCommand, bool>
{
    private readonly IRepository<RolePermission> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRolePermissionsCommandHandler(IRepository<RolePermission> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(UpdateRolePermissionsCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.WhereAsync(rp => rp.RoleId == request.RoleId, cancellationToken);

        foreach (var rp in existing)
        {
            _repository.Delete(rp);
        }

        foreach (var pId in request.PermissionIds)
        {
            await _repository.AddAsync(new RolePermission { Id = System.Guid.NewGuid(), RoleId = request.RoleId, PermissionId = pId }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
