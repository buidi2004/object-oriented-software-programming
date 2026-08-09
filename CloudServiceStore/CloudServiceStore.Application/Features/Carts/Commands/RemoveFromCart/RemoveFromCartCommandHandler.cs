using System;
using System.Linq;
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
    private readonly ICurrentUserService _currentUser;
    private readonly IRepository<Cart> _cartRepo;

    public RemoveFromCartCommandHandler(IUnitOfWork uow, ICurrentUserService currentUser, IRepository<Cart> cartRepo)
    { _uow = uow; _currentUser = currentUser; _cartRepo = cartRepo; }

    public async Task Handle(RemoveFromCartCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CloudServiceStore.Domain.Enums.CartStatus.Active, ct, c => c.Items);

        if (cart == null)
            throw new NotFoundException("Cart không tồn tại");

        var itemExists = cart.Items.Any(i => i.Id == request.ItemId);
        if (!itemExists) throw new UnauthorizedException("Không có quyền xóa item này");

        cart.RemoveItem(request.ItemId);

        await _uow.SaveChangesAsync(ct);
    }
}
