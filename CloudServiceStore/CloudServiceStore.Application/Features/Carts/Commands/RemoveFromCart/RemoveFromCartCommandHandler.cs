using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Commands.RemoveFromCart;

public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<CartItem> _cartItemRepo;
    private readonly IRepository<Cart> _cartRepo;
    private readonly ICurrentUserService _currentUser;

    public RemoveFromCartCommandHandler(IUnitOfWork uow, IRepository<CartItem> cartItemRepo, IRepository<Cart> cartRepo, ICurrentUserService currentUser)
    { _uow = uow; _cartItemRepo = cartItemRepo; _cartRepo = cartRepo; _currentUser = currentUser; }

    public async Task Handle(RemoveFromCartCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        var item = await _cartItemRepo.GetByIdAsync(request.ItemId, ct) ?? throw new NotFoundException("Item không tồn tại");
        
        var cart = await _cartRepo.GetByIdAsync(item.CartId, ct);
        if (cart == null || cart.UserId != userId || cart.Status != CloudServiceStore.Domain.Enums.CartStatus.Active)
            throw new UnauthorizedException("Không có quyền xoá item này");

        _cartItemRepo.Delete(item);
        await _uow.SaveChangesAsync(ct);
    }
}
