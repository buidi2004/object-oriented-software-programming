using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Commands.UpdateCartItem;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;
    private readonly IRepository<Cart> _cartRepo;

    public UpdateCartItemCommandHandler(IUnitOfWork uow, ICurrentUserService currentUser, IRepository<Cart> cartRepo)
    { _uow = uow; _currentUser = currentUser; _cartRepo = cartRepo; }

    public async Task Handle(UpdateCartItemCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CloudServiceStore.Domain.Enums.CartStatus.Active, ct, c => c.Items);

        if (cart == null)
            throw new NotFoundException("Cart không tồn tại");

        var itemExists = cart.Items.Any(i => i.Id == request.ItemId);
        if (!itemExists) throw new UnauthorizedException("Không có quyền cập nhật item này");

        cart.UpdateItemQuantity(request.ItemId, request.Quantity);

        await _uow.SaveChangesAsync(ct);
    }
}
