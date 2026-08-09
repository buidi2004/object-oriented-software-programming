using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wishlists.Commands.RemoveFromWishlist;

public class RemoveFromWishlistCommandHandler : IRequestHandler<RemoveFromWishlistCommand, bool>
{
    private readonly IRepository<WishlistItem> _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public RemoveFromWishlistCommandHandler(IRepository<WishlistItem> repo, IUnitOfWork uow, ICurrentUserService currentUser)
    {
        _repo = repo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var item = await _repo.GetByIdAsync(request.Id, cancellationToken);
        if (item == null) throw new NotFoundException(nameof(WishlistItem), request.Id);
        if (item.UserId != userId) throw new UnauthorizedException("You do not own this wishlist item.");

        _repo.Delete(item);
        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
