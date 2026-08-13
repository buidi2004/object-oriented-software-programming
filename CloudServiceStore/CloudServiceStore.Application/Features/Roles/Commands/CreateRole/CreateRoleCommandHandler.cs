using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Roles.Commands.CreateRole;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Guid>
{
    private readonly IUnitOfWork _uow;

    public CreateRoleCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Guid> Handle(CreateRoleCommand request, CancellationToken ct)
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = request.Name
        };

        await _uow.Roles.AddAsync(role, ct);
        await _uow.SaveChangesAsync(ct);

        return role.Id;
    }
}
