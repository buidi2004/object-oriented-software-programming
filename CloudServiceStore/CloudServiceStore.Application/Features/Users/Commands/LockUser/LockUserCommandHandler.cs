using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Commands.LockUser;

public class LockUserCommandHandler : IRequestHandler<LockUserCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _repo;
    private readonly ICurrentUserService _currentUser;

    public LockUserCommandHandler(IUnitOfWork uow, IRepository<AppUser> repo, ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(LockUserCommand request, CancellationToken ct)
    {
        if (request.UserId == _currentUser.UserId)
            throw new BadRequestException("Không thể tự khoá tài khoản của chính mình.");

        var user = await _repo.GetByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"Người dùng {request.UserId} không tồn tại.");

        user.Deactivate(); // Lock user

        _repo.Update(user);
        await _uow.SaveChangesAsync(ct);
    }
}
