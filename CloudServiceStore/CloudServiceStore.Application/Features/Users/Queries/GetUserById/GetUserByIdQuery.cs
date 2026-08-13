using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Queries.GetUserById;

public record UserDetailDto(
    Guid Id,
    string Email,
    string FullName,
    string RoleName,
    bool IsActive,
    DateTime CreatedAt);

public record GetUserByIdQuery(Guid Id) : IRequest<UserDetailDto>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDetailDto>
{
    private readonly IRepository<AppUser> _userRepo;
    private readonly IRepository<Role> _roleRepo;

    public GetUserByIdQueryHandler(IRepository<AppUser> userRepo, IRepository<Role> roleRepo)
    {
        _userRepo = userRepo;
        _roleRepo = roleRepo;
    }

    public async Task<UserDetailDto> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException("Người dùng không tồn tại.");

        var roles = await _roleRepo.GetAllAsync(ct);
        var roleName = roles.FirstOrDefault(r => r.Id == user.RoleId)?.Name ?? "Customer";

        return new UserDetailDto(user.Id, user.Email, user.FullName, roleName, user.IsActive, user.CreatedAt);
    }
}
