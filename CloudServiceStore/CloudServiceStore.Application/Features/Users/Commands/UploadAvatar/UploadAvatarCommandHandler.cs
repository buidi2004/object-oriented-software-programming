using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Commands.UploadAvatar;

public class UploadAvatarCommandHandler : IRequestHandler<UploadAvatarCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUser;

    public UploadAvatarCommandHandler(
        IUnitOfWork uow,
        IRepository<AppUser> userRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _userRepo = userRepo;
        _currentUser = currentUser;
    }

    public async Task Handle(UploadAvatarCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var user = await _userRepo.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("Không tìm thấy người dùng.");

        user.UpdateAvatarUrl(request.AvatarUrl);

        _userRepo.Update(user);
        await _uow.SaveChangesAsync(ct);
    }
}
