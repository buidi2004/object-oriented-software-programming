using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Roles.Queries.GetAllRoles;

public class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, IReadOnlyList<RoleDto>>
{
    private readonly IUnitOfWork _uow;

    public GetAllRolesQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<IReadOnlyList<RoleDto>> Handle(GetAllRolesQuery request, CancellationToken ct)
    {
        var roles = await _uow.Roles.GetAllAsync(ct);
        return roles.Select(r => new RoleDto(r.Id, r.Name)).ToList().AsReadOnly();
    }
}
