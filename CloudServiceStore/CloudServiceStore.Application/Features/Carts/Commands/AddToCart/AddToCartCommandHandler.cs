using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Commands.AddToCart;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Cart> _cartRepo;
    private readonly IRepository<CartItem> _cartItemRepo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly ICurrentUserService _currentUser;

    public AddToCartCommandHandler(
        IUnitOfWork uow, 
        IRepository<Cart> cartRepo, 
        IRepository<CartItem> cartItemRepo,
        IRepository<ServicePlan> planRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _cartRepo = cartRepo;
        _cartItemRepo = cartItemRepo;
        _planRepo = planRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddToCartCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập");

        var planExists = await _planRepo.AnyAsync(p => p.Id == request.ServicePlanId && p.IsActive, ct);
        if (!planExists)
            throw new NotFoundException("Gói dịch vụ không tồn tại hoặc đã bị khoá.");

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CloudServiceStore.Domain.Enums.CartStatus.Active, ct);
        if (cart == null)
        {
            cart = new Cart { Id = Guid.NewGuid(), UserId = userId, Status = CloudServiceStore.Domain.Enums.CartStatus.Active };
            await _cartRepo.AddAsync(cart, ct);
            // Must save changes to get cart ID before adding item, though since we generate ID here, it's fine.
        }

        var existingItems = await _cartItemRepo.WhereAsync(ci => ci.CartId == cart.Id && ci.ServicePlanId == request.ServicePlanId && ci.BillingCycle == request.BillingCycle, ct);
        var item = existingItems.FirstOrDefault();

        if (item != null)
        {
            item.Quantity += request.Quantity;
            _cartItemRepo.Update(item);
        }
        else
        {
            item = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ServicePlanId = request.ServicePlanId,
                BillingCycle = request.BillingCycle,
                Quantity = request.Quantity
            };
            await _cartItemRepo.AddAsync(item, ct);
        }

        await _uow.SaveChangesAsync(ct);
        return item.Id;
    }
}
