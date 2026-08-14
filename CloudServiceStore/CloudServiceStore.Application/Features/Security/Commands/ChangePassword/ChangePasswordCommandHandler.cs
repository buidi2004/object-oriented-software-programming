using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Security.Commands.ChangePassword;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Unit>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPasswordHasher _passwordHasher;

    public ChangePasswordCommandHandler(IUnitOfWork uow, IRepository<AppUser> userRepo, ICurrentUserService currentUserService, IPasswordHasher passwordHasher)
    {
        _uow = uow;
        _userRepo = userRepo;
        _currentUserService = currentUserService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Unit> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            throw new UnauthorizedException("Người dùng chưa đăng nhập.");
        }

        var user = await _userRepo.GetByIdAsync(_currentUserService.UserId.Value, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("Người dùng không tồn tại.");
        }

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác.");
        }

        var newPasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.ChangePassword(newPasswordHash);

        _userRepo.Update(user);
        await _uow.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
