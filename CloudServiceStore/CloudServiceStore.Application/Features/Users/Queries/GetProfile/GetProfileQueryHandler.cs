using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Queries.GetProfile;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, ProfileDto>
{
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUserService;

    public GetProfileQueryHandler(IRepository<AppUser> userRepo, ICurrentUserService currentUserService)
    {
        _userRepo = userRepo;
        _currentUserService = currentUserService;
    }

    public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
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

        return new ProfileDto(
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.FirstName,
            user.LastName,
            user.Country,
            user.City,
            user.Ward,
            user.AddressLine,
            user.CompanyName,
            user.TaxCode,
            user.CreatedAt
        );
    }
}
