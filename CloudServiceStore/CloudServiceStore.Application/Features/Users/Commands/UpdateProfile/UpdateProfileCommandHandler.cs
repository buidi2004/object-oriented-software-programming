using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Unit>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUserService;

    public UpdateProfileCommandHandler(IUnitOfWork uow, IRepository<AppUser> userRepo, ICurrentUserService currentUserService)
    {
        _uow = uow;
        _userRepo = userRepo;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
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

        user.UpdateProfile(
            request.FullName,
            request.PhoneNumber,
            request.FirstName,
            request.LastName,
            request.Country,
            request.City,
            request.Ward,
            request.AddressLine,
            request.CompanyName,
            request.TaxCode
        );

        _userRepo.Update(user);
        await _uow.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
