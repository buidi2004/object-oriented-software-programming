using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Commands.ChangeRole;

public class ChangeUserRoleCommandHandler : IRequestHandler<ChangeUserRoleCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _repo;

    public ChangeUserRoleCommandHandler(IUnitOfWork uow, IRepository<AppUser> repo)
    {
        _uow = uow;
        _repo = repo;
    }

    public async Task Handle(ChangeUserRoleCommand request, CancellationToken ct)
    {
        var user = await _repo.GetByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"Người dùng {request.UserId} không tồn tại.");

        // In a real application, you might want to validate the RoleName against a Role repository or enum
        // user.RoleId = newRoleId... (simplified for this module)

        // _repo.Update(user);
        // await _uow.SaveChangesAsync(ct);
        
        await Task.CompletedTask; // Placeholder as role assignment might require identity framework integration
    }
}
