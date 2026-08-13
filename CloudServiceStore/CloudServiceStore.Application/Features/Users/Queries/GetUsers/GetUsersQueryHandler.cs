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

    public GetUsersQueryHandler(IRepository<AppUser> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<UserDto>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        var users = await _repo.GetAllAsync(ct);

        return users.Select(u => new UserDto(
            u.Id, u.Email, u.FullName, u.IsActive
        )).ToList().AsReadOnly();
    }
}
