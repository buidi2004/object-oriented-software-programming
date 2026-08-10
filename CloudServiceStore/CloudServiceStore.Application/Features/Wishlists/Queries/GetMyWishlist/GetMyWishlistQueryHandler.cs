using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wishlists.Queries.GetMyWishlist;

public class GetMyWishlistQueryHandler : IRequestHandler<GetMyWishlistQuery, IReadOnlyList<WishlistItemDto>>
{
    private readonly IRepository<WishlistItem> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyWishlistQueryHandler(IRepository<WishlistItem> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<WishlistItemDto>> Handle(GetMyWishlistQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");
        
        var items = await _repo.WhereAsync(w => w.UserId == userId, cancellationToken);
        return items.Select(w => new WishlistItemDto
        {
            Id = w.Id,
            ServicePlanId = w.ServicePlanId,
            ServicePlanName = w.ServicePlan?.Name ?? string.Empty,
            AddedAt = w.AddedAt
        }).ToList();
    }
}
