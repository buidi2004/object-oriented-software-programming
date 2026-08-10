using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions;

public class GetAllPermissionsQueryHandler : IRequestHandler<GetAllPermissionsQuery, IEnumerable<PermissionDto>>
{
    private readonly IRepository<Permission> _repository;

    public GetAllPermissionsQueryHandler(IRepository<Permission> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PermissionDto>> Handle(GetAllPermissionsQuery request, CancellationToken cancellationToken)
    {
        var permissions = await _repository.GetAllAsync(cancellationToken);
        
        return permissions.Select(p => new PermissionDto
        {
            Id = p.Id,
            Code = p.Code,
            Description = p.Description
        }).ToList();
    }
}
