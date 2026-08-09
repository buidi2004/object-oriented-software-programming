using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;

namespace CloudServiceStore.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResult>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _userRepo;
    private readonly IPasswordHasher _hasher;

    public RegisterCommandHandler(IUnitOfWork uow, IRepository<AppUser> userRepo, IPasswordHasher hasher)
    {
        _uow = uow;
        _userRepo = userRepo;
        _hasher = hasher;
    }

    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken ct)
    {
        var existing = await _userRepo.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (existing is not null)
            throw new ConflictException("Email đã được sử dụng.");

        var roleId = await _uow.Roles.GetIdByNameAsync("Customer", ct);

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = _hasher.Hash(request.Password),
            PhoneNumber = request.PhoneNumber,
            RoleId = roleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.AddAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        return new RegisterResult(user.Id, user.Email);
    }
}
