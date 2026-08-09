using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Loyalty.Queries.GetMyLoyalty;

public class GetMyLoyaltyQueryHandler : IRequestHandler<GetMyLoyaltyQuery, LoyaltyDto>
{
    private readonly IRepository<LoyaltyPoint> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyLoyaltyQueryHandler(IRepository<LoyaltyPoint> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<LoyaltyDto> Handle(GetMyLoyaltyQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var point = await _repo.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (point == null)
        {
            return new LoyaltyDto { UserId = userId, Points = 0 };
        }

        return new LoyaltyDto { UserId = userId, Points = point.Points };
    }
}
