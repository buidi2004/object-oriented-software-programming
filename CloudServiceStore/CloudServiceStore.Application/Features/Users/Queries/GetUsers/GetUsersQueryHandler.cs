using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Queries.GetUsers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, IReadOnlyList<UserDto>>
{
    private readonly IRepository<AppUser> _repo;
    private readonly IRepository<Role> _roleRepo;

    public GetUsersQueryHandler(IRepository<AppUser> repo, IRepository<Role> roleRepo)
    {
        _repo = repo;
        _roleRepo = roleRepo;
    }

    public async Task<IReadOnlyList<UserDto>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        var users = await _repo.GetAllAsync(ct);
        var roles = await _roleRepo.GetAllAsync(ct);

        return users.Select(u => 
        {
            var role = roles.FirstOrDefault(r => r.Id == u.RoleId);
            return new UserDto(
                u.Id, 
                u.Email, 
                u.FullName, 
                u.IsActive,
                role?.Name ?? "Customer",
                u.PhoneNumber,
                u.CreatedAt,
                null
            );
        }).OrderByDescending(u => u.CreatedAt).ToList().AsReadOnly();
    }
}
